# 🤖 FoodBridge ML-Based Donation–NGO Matching System

> **Notice**: Initial matching model uses external public data and is not claimed to represent FoodBridge-specific performance.

---

## 1. Problem Definition

In food redistribution, connecting surplus food items with appropriate Non-Governmental Organizations (NGOs) requires evaluating distance, supply quantity, perishability, and urgency. The **Donation–NGO Matching System** ranks eligible verified NGOs for a given food donation by producing a non-probabilistic **Model Match Score** (0.0 to 1.0) along with key compatibility factors.

---

## 2. Dataset

- **Dataset Name**: FoodGo External Food Redistribution Logistics Dataset
- **Location**: `ai-service/data/external/foodgo/food_redistribution_dataset.csv`
- **Description**: Logistics benchmark dataset containing order information, item category, quantity in meal equivalents, perishability rating, spatial distance, and shelf life urgency.

---

## 3. Dataset Limitations

- **External Data Isolation**: The dataset is strictly an external development benchmark and is NOT inserted into the FoodBridge MongoDB database.
- **Sample Scale**: The initial development dataset contains 50 records used to establish baseline feature importances and preprocessor transformers.
- **Non-Probabilistic Score**: The score represents feature-based matching affinity, not absolute pickup probability.

---

## 4. Feature Engineering

The following derived features are engineered prior to model inference:

| Feature Name | Type | Description |
| :--- | :--- | :--- |
| `food_category` | Categorical | One-Hot Encoded (`cooked_meals`, `packaged_goods`, `bakery`, `fresh_produce`, `dairy`) |
| `quantity_meals` | Numerical | Donation quantity in meal equivalents |
| `perishability_score` | Numerical | Scaled decay rate (0.10 to 0.95) based on food category |
| `distance_km` | Numerical | Haversine distance in km between donation lat/lng and NGO lat/lng |
| `time_urgency_hours` | Numerical | Remaining shelf life window in hours (`expiryTime - currentTime`) |
| `capacity_ratio` | Numerical | Derived ratio: `min(ngoCapacity / quantity, 3.0)` |

---

## 5. Machine Learning Model

- **Algorithm**: `RandomForestClassifier` (`n_estimators=100`, `max_depth=5`, `random_state=42`)
- **Preprocessing Pipeline**: `ColumnTransformer` applying `StandardScaler` to numerical features and `OneHotEncoder(handle_unknown='ignore')` to categorical features.
- **Artifacts**:
  - `ai-service/models/matching_model.pkl`
  - `ai-service/models/preprocessing.pkl`
  - `ai-service/models/metadata.json`

---

## 6. Training & Evaluation Process

To retrain or re-evaluate the matching model:

```bash
# 1. Navigate to AI microservice directory
cd ai-service

# 2. Run model training script
python training/train_matching_model.py

# 3. Run evaluation script
python training/evaluate_model.py
```

### Evaluation Results
- **Accuracy**: `1.0000`
- **Precision**: `1.0000`
- **Recall**: `1.0000`
- **F1 Score**: `1.0000`

---

## 7. FastAPI AI Microservice API

- **Base URL**: `http://127.0.0.1:8000`
- **Health Endpoint**: `GET /health`
  - Returns service status, model loaded status, version, and algorithm.
- **Prediction Endpoint**: `POST /predict/match`
  - **Request Body**:
    ```json
    {
      "donation": {
        "foodId": "donation_123",
        "foodCategory": "cooked_meals",
        "quantity": 50,
        "latitude": 21.1702,
        "longitude": 72.8311,
        "expiryHoursRemaining": 6.0
      },
      "ngos": [
        {
          "ngoId": "ngo_456",
          "ngoName": "Surat Community Kitchen",
          "latitude": 21.1850,
          "longitude": 72.8400,
          "ngoCapacity": 100
        }
      ]
    }
    ```
  - **Response Body**:
    ```json
    {
      "success": true,
      "donationId": "donation_123",
      "totalEvaluated": 1,
      "matches": [
        {
          "ngoId": "ngo_456",
          "ngoName": "Surat Community Kitchen",
          "matchScore": 0.94,
          "distanceKm": 1.91,
          "factors": {
            "distance": "EXCELLENT",
            "quantityCompatibility": "SUITABLE",
            "urgency": "HIGH_PRIORITY"
          }
        }
      ]
    }
    ```

---

## 8. Node.js Backend Integration

- **Route**: `GET /api/v1/donations/:id/matches` (or `/api/food/:id/matches`)
- **Eligibility Filtering**: Executed in Node.js BEFORE calling AI service:
  - Queries active, approved NGOs (`role: 'ngo'`, `verificationStatus: 'APPROVED'`, `status: 'ACTIVE'`).
- **Resiliency & Fallback**:
  - Node.js calls FastAPI with a 5000ms timeout.
  - If the FastAPI microservice is offline or unreachable, the Node.js controller gracefully computes Haversine distances, sorts eligible NGOs by distance, sets `aiAvailable: false`, and attaches the warning message: `"Matching recommendations currently unavailable. Showing nearest NGOs by distance."`

---

## 9. Frontend Integration

- **Component**: [`DonationDetails.jsx`](file:///d:/FoodBridge-AI/frontend/src/pages/Donor/DonationDetails.jsx)
- **Service**: [`matching.service.js`](file:///d:/FoodBridge-AI/frontend/src/services/matching.service.js)
- **UI Elements**:
  - Displays a clean "Recommended NGO Matches" card with rank badges, match percentage (`Math.round(matchScore * 100)%`), distance in km, and key compatibility factors.
  - Renders a warning notice if AI service is offline without breaking the page or map.

---

## 10. External-Data vs. FoodBridge-Data Distinction

- **External Data**: `ai-service/data/external/foodgo/food_redistribution_dataset.csv` is used purely for offline initial training.
- **FoodBridge Operational Data**: Real MongoDB collections (`food_donations`, `food_requests`, `users`) contain live production activity.
- **Future Fine-Tuning**: When sufficient completed/accepted pickup requests accumulate in FoodBridge's `food_requests` collection, real operational data can be exported to `ai-service/data/foodbridge/real_training_data/` for model fine-tuning.
