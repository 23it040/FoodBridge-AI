# 📊 External Dataset Analysis Report

**Dataset Name**: FoodGo External Food Redistribution Logistics Dataset  
**Source**: External Public Food Redistribution & Logistics Benchmark  
**Storage Location**: `ai-service/data/external/foodgo/food_redistribution_dataset.csv`  

---

## 🔍 Dataset Metadata & Structure

- **Total Rows**: 50 records
- **Total Columns**: 8 features
- **Missing Values**: 0 missing values across all columns
- **Duplicate Records**: 0 duplicates

### Column Definitions & Data Types

| Column Name | Data Type | Description | Sample Range / Values |
| :--- | :--- | :--- | :--- |
| `order_id` | String / Object | Unique order identifier | `ORD1001` - `ORD1050` |
| `food_category` | Categorical String | Type of food items | `cooked_meals`, `packaged_goods`, `bakery`, `fresh_produce`, `dairy` |
| `quantity_meals` | Numerical (Integer) | Quantity of food items in meal equivalents | 30 - 500 meals |
| `perishability_score` | Numerical (Float) | Perishability rating (0.0 = low decay, 1.0 = highly perishable) | 0.10 - 0.95 |
| `distance_km` | Numerical (Float) | Distance between pickup and recipient location in km | 1.5 - 30.0 km |
| `time_urgency_hours` | Numerical (Float) | Remaining shelf life / window in hours | 1.0 - 120.0 hours |
| `ngo_capacity_meals` | Numerical (Integer) | Recipient NGO distribution capacity in meals | 40 - 400 meals |
| `matched` | Binary Target (Int) | Historical redistribution match success (1 = Matched, 0 = Unmatched/Expired) | 0 or 1 |

---

## 💡 Feature Classification

### 1. Useful Features for ML Model
- `food_category`: Encoded via One-Hot Encoding to capture category-specific redistribution characteristics.
- `quantity_meals`: Scaled numerical feature representing supply scale.
- `perishability_score`: Scaled numeric feature representing food decay risk.
- `distance_km`: Primary spatial proximity feature.
- `time_urgency_hours`: Time-sensitive shelf life window.
- `ngo_capacity_meals`: Recipient NGO capacity.
- `capacity_ratio` (Derived): `ngo_capacity_meals / quantity_meals` to represent capacity fit.

### 2. Unusable / Metadata Features
- `order_id`: Arbitrary row identifier; dropped during preprocessing.

### 3. Target Variable
- `matched`: Binary classification target indicating whether a donation request resulted in a successful pickup match (1) or timed out/unmatched (0).

---

## ⚠️ Limitations & FoodBridge Mapping

1. **External Data Distinction**:
   - This dataset is strictly an **external development dataset** used for initializing the matching model weights.
   - It is kept separate from real FoodBridge MongoDB records and is NOT inserted into the production database.
2. **FoodBridge Operational Mapping**:
   - `quantity_meals` maps to `FoodDonation.quantity`.
   - `food_category` maps to `FoodDonation.category`.
   - `distance_km` is computed dynamically via Haversine formula using donor (`latitude`, `longitude`) and NGO (`latitude`, `longitude`).
   - `time_urgency_hours` is computed as `(expiryTime - currentTime)` in hours.
3. **Future Production Enhancements**:
   - Once sufficient operational request outcomes (`ACCEPTED` vs `REJECTED` / `EXPIRED`) accumulate in FoodBridge's `food_requests` collection, the matching model can be incrementally fine-tuned using real FoodBridge event logs.
