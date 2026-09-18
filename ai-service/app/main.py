import os
import json
import math
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional

app = FastAPI(
    title="FoodBridge AI - Donation-NGO Matching Service",
    version="1.0.0",
    description="Machine Learning matching microservice for ranking eligible NGOs against food donations."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model state
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, 'models')

model = None
preprocessor = None
metadata = {}

def load_artifacts():
    global model, preprocessor, metadata
    model_path = os.path.join(MODELS_DIR, 'matching_model.pkl')
    preprocessor_path = os.path.join(MODELS_DIR, 'preprocessing.pkl')
    metadata_path = os.path.join(MODELS_DIR, 'metadata.json')

    if os.path.exists(model_path) and os.path.exists(preprocessor_path):
        model = joblib.load(model_path)
        preprocessor = joblib.load(preprocessor_path)
        print("Loaded ML matching model & preprocessor successfully.")
    else:
        print("Warning: Model artifacts not found. Please run training script first.")

    if os.path.exists(metadata_path):
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)

@app.on_event("startup")
def startup_event():
    load_artifacts()

class DonationInput(BaseModel):
    foodId: Optional[str] = "donation_item"
    foodCategory: Optional[str] = "cooked_meals"
    quantity: float = Field(..., gt=0, description="Quantity of meals")
    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")
    expiryHoursRemaining: Optional[float] = 6.0

class NGOInput(BaseModel):
    ngoId: str
    ngoName: Optional[str] = "Verified NGO"
    latitude: float
    longitude: float
    ngoCapacity: Optional[float] = 100.0

class MatchRequest(BaseModel):
    donation: DonationInput
    ngos: List[NGOInput]

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def get_perishability_score(category: str) -> float:
    cat_lower = str(category).lower()
    if 'cooked' in cat_lower or 'meal' in cat_lower:
        return 0.85
    elif 'dairy' in cat_lower or 'milk' in cat_lower:
        return 0.80
    elif 'bakery' in cat_lower or 'bread' in cat_lower:
        return 0.70
    elif 'produce' in cat_lower or 'vegetable' in cat_lower or 'fruit' in cat_lower:
        return 0.60
    return 0.30

@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "FoodBridge Donation-NGO Matching AI",
        "modelLoaded": model is not None and preprocessor is not None,
        "version": metadata.get("model_version", "1.0.0"),
        "algorithm": metadata.get("algorithm", "RandomForestClassifier")
    }

def calculate_logistics_score(dist_km: float, donation_qty: float, ngo_cap: float, food_category: str, expiry_hours: float):
    # 1. Distance Score (0-100)
    if dist_km <= 5.0:
        dist_pts = 100.0
    elif dist_km <= 10.0:
        dist_pts = 90.0
    elif dist_km <= 15.0:
        dist_pts = 75.0
    elif dist_km <= 20.0:
        dist_pts = 60.0
    elif dist_km <= 25.0:
        dist_pts = 45.0
    elif dist_km <= 30.0:
        dist_pts = 35.0
    elif dist_km <= 40.0:
        dist_pts = 25.0
    elif dist_km <= 50.0:
        dist_pts = 15.0
    else:
        dist_pts = 10.0

    # 2. Capacity Score (0-100)
    cap = ngo_cap if ngo_cap and ngo_cap > 0 else 100.0
    if donation_qty <= cap:
        cap_pts = 100.0
    else:
        ratio = donation_qty / cap
        if ratio <= 1.25:
            cap_pts = 80.0
        elif ratio <= 1.5:
            cap_pts = 60.0
        elif ratio <= 2.0:
            cap_pts = 40.0
        else:
            cap_pts = 20.0

    # 3. Category Score (0-100)
    cat_pts = 90.0

    # 4. Quantity Score (0-100)
    if donation_qty >= 50:
        qty_pts = 100.0
    elif donation_qty >= 20:
        qty_pts = 85.0
    elif donation_qty >= 10:
        qty_pts = 70.0
    else:
        qty_pts = 50.0

    # 5. Urgency Score (0-100)
    if expiry_hours <= 3.0:
        urg_pts = 100.0
    elif expiry_hours <= 6.0:
        urg_pts = 90.0
    elif expiry_hours <= 12.0:
        urg_pts = 75.0
    elif expiry_hours <= 24.0:
        urg_pts = 60.0
    else:
        urg_pts = 50.0

    # Weighted Base Score (45/25/15/10/5)
    base_score = (dist_pts * 0.45) + (cap_pts * 0.25) + (cat_pts * 0.15) + (qty_pts * 0.10) + (urg_pts * 0.05)

    # Hard Distance Penalty Caps
    final_score = base_score
    if dist_km > 100.0:
        final_score = min(final_score, 20.0)
        final_score = max(10.0, min(20.0, final_score))
    elif dist_km > 50.0:
        final_score = min(final_score, 30.0)
        final_score = max(10.0, min(30.0, final_score))
    elif dist_km > 40.0:
        final_score = min(final_score, 35.0)
    elif dist_km > 30.0:
        final_score = min(final_score, 45.0)
    elif dist_km > 20.0:
        final_score = min(final_score, 55.0)

    final_score_int = int(round(max(10.0, min(100.0, final_score))))

    if final_score_int >= 80:
        recommendation = "HIGH MATCH"
    elif final_score_int >= 60:
        recommendation = "RECOMMENDED"
    elif final_score_int >= 36:
        recommendation = "LOW MATCH"
    else:
        recommendation = "NOT RECOMMENDED"

    reasons = []
    if cap_pts >= 80:
        reasons.append("✓ Capacity compatible")
    if cat_pts >= 80:
        reasons.append("✓ Food category compatible")

    if dist_km <= 10.0:
        reasons.append(f"✓ Nearby pickup ({round(dist_km, 1)} km)")
    elif dist_km > 40.0:
        reasons.append(f"✕ Pickup distance {round(dist_km, 1)} km (Impractical)")
    else:
        reasons.append(f"✕ Pickup distance {round(dist_km, 1)} km")

    return {
        "score": final_score_int,
        "matchScore": final_score_int,
        "recommendation": recommendation,
        "matchLevel": recommendation,
        "distanceKm": round(dist_km, 1),
        "breakdown": {
            "distance": int(round(dist_pts)),
            "capacity": int(round(cap_pts)),
            "category": int(round(cat_pts)),
            "quantity": int(round(qty_pts)),
            "urgency": int(round(urg_pts))
        },
        "reasons": reasons
    }

@app.post("/predict/match")
def predict_match(request: MatchRequest):
    donation = request.donation
    ngos = request.ngos

    if not ngos:
        return {
            "success": True,
            "donationId": donation.foodId,
            "matches": []
        }

    results = []
    for ngo in ngos:
        if ngo.latitude is None or ngo.longitude is None or donation.latitude is None or donation.longitude is None:
            continue

        dist = haversine_distance(donation.latitude, donation.longitude, ngo.latitude, ngo.longitude)
        cap = ngo.ngoCapacity if ngo.ngoCapacity and ngo.ngoCapacity > 0 else 100.0
        urgency = donation.expiryHoursRemaining if donation.expiryHoursRemaining and donation.expiryHoursRemaining > 0 else 6.0

        eval_res = calculate_logistics_score(
            dist_km=dist,
            donation_qty=donation.quantity,
            ngo_cap=cap,
            food_category=donation.foodCategory or "cooked_meals",
            expiry_hours=urgency
        )

        results.append({
            "ngoId": ngo.ngoId,
            "ngoName": ngo.ngoName or "Verified NGO Partner",
            "score": eval_res["score"],
            "matchScore": eval_res["matchScore"],
            "recommendation": eval_res["recommendation"],
            "matchLevel": eval_res["matchLevel"],
            "distanceKm": eval_res["distanceKm"],
            "breakdown": eval_res["breakdown"],
            "reasons": eval_res["reasons"],
            "factors": {
                "distance": "EXCELLENT" if dist <= 5.0 else ("GOOD" if dist <= 15.0 else "FAIR"),
                "quantityCompatibility": "SUITABLE" if cap >= donation.quantity else "PARTIAL",
                "urgency": "HIGH_PRIORITY" if urgency <= 6.0 else "NORMAL"
            }
        })

    # Sort NGOs descending by score
    results.sort(key=lambda x: x["score"], reverse=True)

    return {
        "success": True,
        "donationId": donation.foodId,
        "totalEvaluated": len(results),
        "matches": results
    }
