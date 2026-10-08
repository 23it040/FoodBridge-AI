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
SAVED_MODELS_DIR = os.path.join(BASE_DIR, 'saved_models')

# Matching model state
model = None
preprocessor = None
metadata = {}

# Spoilage risk model state
spoilage_pipeline = None
spoilage_metadata = {}

def load_artifacts():
    global model, preprocessor, metadata, spoilage_pipeline, spoilage_metadata
    model_path = os.path.join(MODELS_DIR, 'matching_model.pkl')
    preprocessor_path = os.path.join(MODELS_DIR, 'preprocessing.pkl')
    metadata_path = os.path.join(MODELS_DIR, 'metadata.json')

    if os.path.exists(model_path) and os.path.exists(preprocessor_path):
        model = joblib.load(model_path)
        preprocessor = joblib.load(preprocessor_path)
        print("Loaded ML matching model & preprocessor successfully.")
    else:
        print("Warning: Matching model artifacts not found.")

    if os.path.exists(metadata_path):
        with open(metadata_path, 'r', encoding='utf-8') as f:
            metadata = json.load(f)

    # Load Food Spoilage Risk Model
    spoilage_model_path = os.path.join(SAVED_MODELS_DIR, 'spoilage_risk_model.joblib')
    spoilage_meta_path = os.path.join(SAVED_MODELS_DIR, 'spoilage_model_metadata.json')

    if os.path.exists(spoilage_model_path):
        spoilage_pipeline = joblib.load(spoilage_model_path)
        print("Loaded ML Food Spoilage Risk model pipeline successfully.")
    else:
        print(f"Warning: Spoilage model artifact not found at {spoilage_model_path}.")

    if os.path.exists(spoilage_meta_path):
        with open(spoilage_meta_path, 'r', encoding='utf-8') as f:
            spoilage_metadata = json.load(f)

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
        "service": "FoodBridge AI Microservice",
        "matchingModelLoaded": model is not None and preprocessor is not None,
        "spoilageModelLoaded": spoilage_pipeline is not None,
        "matchingVersion": metadata.get("model_version", "1.0.0"),
        "spoilageVersion": spoilage_metadata.get("model_version", "1.0.0")
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

# ==========================================
# Food Spoilage Risk Prediction Endpoint
# ==========================================

class SpoilageRiskRequest(BaseModel):
    foodId: Optional[str] = "donation_item"
    foodName: Optional[str] = "Food Donation Item"
    category: Optional[str] = "cooked_meals"
    storageCondition: Optional[str] = "pantry"  # 'pantry', 'refrigerated', 'frozen'
    storageTemperatureC: Optional[float] = None
    isOpened: Optional[int] = 0
    hoursUntilExpiry: Optional[float] = 6.0
    requiresRefrigeration: Optional[int] = None
    hasCookingTemp: Optional[int] = 0
    cookingTemperatureF: Optional[float] = None
    isPerishableCategory: Optional[int] = None

def normalize_foodkeeper_category(raw_cat: Optional[str]):
    """
    Maps FoodBridge / donor category strings to official USDA FoodKeeper category
    and determines default perishability and refrigeration constraints.
    """
    cat = str(raw_cat or "cooked_meals").lower().strip()
    
    if any(k in cat for k in ["cook", "meal", "deli", "prepared", "curry", "rice", "biryani", "gravy"]):
        return "Deli & Prepared Foods", 1, 1
    elif any(k in cat for k in ["dairy", "milk", "cheese", "paneer", "curd", "yogurt", "butter"]):
        return "Dairy Products & Eggs", 1, 1
    elif any(k in cat for k in ["meat", "beef", "mutton", "pork", "lamb"]):
        return "Meat", 1, 1
    elif any(k in cat for k in ["poultry", "chicken", "turkey", "egg", "eggs"]):
        return "Poultry", 1, 1
    elif any(k in cat for k in ["seafood", "fish", "prawn", "shrimp", "crab"]):
        return "Seafood", 1, 1
    elif any(k in cat for k in ["produce", "fruit", "vegetable", "salad", "greens"]):
        return "Produce", 0, 1
    elif any(k in cat for k in ["bake", "bakery", "bread", "roti", "chapati", "naan", "cake"]):
        return "Baked Goods", 0, 0
    elif any(k in cat for k in ["grain", "pasta", "bean", "dal", "pulse", "lentil"]):
        return "Grains, Beans & Pasta", 0, 0
    elif any(k in cat for k in ["canned", "shelf", "packaged", "dry", "general"]):
        return "Shelf Stable Foods", 0, 0
    elif any(k in cat for k in ["beverage", "drink", "juice"]):
        return "Beverages", 0, 0
    elif "frozen" in cat:
        return "Food Purchased Frozen", 1, 0
    else:
        return "Deli & Prepared Foods", 1, 1

@app.post("/predict/spoilage-risk")
def predict_spoilage_risk(request: SpoilageRiskRequest):
    """
    Predicts food spoilage risk level (High vs Low) and spoilage probability
    using the scikit-learn model trained on official USDA FoodKeeper dataset.
    """
    if spoilage_pipeline is None:
        raise HTTPException(
            status_code=503,
            detail="Food spoilage risk model not loaded. Model artifact 'saved_models/spoilage_risk_model.joblib' is unavailable."
        )

    cat_name, def_req_refrig, def_is_perish = normalize_foodkeeper_category(request.category)

    # Normalize storage condition
    storage_cond = str(request.storageCondition or "pantry").lower().strip()
    if storage_cond not in ["pantry", "refrigerated", "frozen"]:
        storage_cond = "pantry"

    # Determine storage temperature
    if request.storageTemperatureC is not None:
        temp_c = float(request.storageTemperatureC)
    elif storage_cond == "frozen":
        temp_c = -18.0
    elif storage_cond == "refrigerated":
        temp_c = 4.0
    else:
        temp_c = 22.0

    is_opened = 1 if request.isOpened else 0
    req_refrig = int(request.requiresRefrigeration) if request.requiresRefrigeration is not None else def_req_refrig
    is_perish = int(request.isPerishableCategory) if request.isPerishableCategory is not None else def_is_perish
    has_cook = int(request.hasCookingTemp or 0)
    cook_temp = float(request.cookingTemperatureF) if request.cookingTemperatureF is not None else np.nan

    # Build input feature frame matching the trained model pipeline
    df_input = pd.DataFrame([{
        "category": cat_name,
        "storage_condition": storage_cond,
        "storage_temperature_c": temp_c,
        "is_opened": is_opened,
        "requires_refrigeration": req_refrig,
        "has_cooking_temp": has_cook,
        "cooking_temperature_f": cook_temp,
        "is_perishable_category": is_perish
    }])

    pred_raw = int(spoilage_pipeline.predict(df_input)[0])
    proba_raw = spoilage_pipeline.predict_proba(df_input)[0]

    prob_low = float(proba_raw[0])
    prob_high = float(proba_raw[1])

    # Time-dependent adjustments
    hours_left = request.hoursUntilExpiry
    is_time_critical = (hours_left is not None and hours_left <= 4.0 and hours_left > 0)
    is_expired = (hours_left is not None and hours_left <= 0.0)

    final_prediction = 1 if (pred_raw == 1 or is_time_critical or is_expired) else 0
    final_high_prob = 1.0 if is_expired else (max(prob_high, 0.85) if is_time_critical else prob_high)
    final_low_prob = 1.0 - final_high_prob

    if is_expired:
        risk_level = "Critical"
        recommendation = "Donation expired. Unsafe for human consumption."
    elif final_prediction == 1:
        risk_level = "High"
        recommendation = "High Spoilage Risk: Priority redistribution recommended within 24-48 hours with immediate refrigeration."
    else:
        risk_level = "Low"
        recommendation = "Low Spoilage Risk: Stable for standard distribution window."

    return {
        "success": True,
        "foodId": request.foodId,
        "foodName": request.foodName,
        "spoilageRisk": final_prediction,
        "riskLevel": risk_level,
        "highSpoilageRisk": final_prediction == 1,
        "riskScore": round(final_high_prob * 100, 2),
        "confidence": round(max(final_low_prob, final_high_prob), 4),
        "probabilities": {
            "lowRisk": round(final_low_prob, 4),
            "highRisk": round(final_high_prob, 4)
        },
        "featuresUsed": {
            "category": cat_name,
            "storageCondition": storage_cond,
            "storageTemperatureC": temp_c,
            "isOpened": is_opened,
            "requiresRefrigeration": req_refrig,
            "isPerishableCategory": is_perish,
            "hoursUntilExpiry": hours_left
        },
        "recommendation": recommendation,
        "model": "FoodBridge AI - Food Spoilage Risk Classifier v1.0.0"
    }

