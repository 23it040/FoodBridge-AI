import logging
import pandas as pd
from typing import Dict, Any
from datetime import datetime
from ai_service.app.utils.loaders import MODEL_METADATA

logger = logging.getLogger("ai_service")

VALID_CATEGORIES = [
    "Beverages", "Biryani", "Desert", "Extras", "Fish", "Other Snacks",
    "Pasta", "Pizza", "Rice Bowl", "Salad", "Sandwich", "Seafood", "Soup", "Starters"
]

def normalize_category(raw_cat: str) -> str:
    if not raw_cat:
        return ""
    cat_str = str(raw_cat).strip().lower()
    mapping = {
        "rice": "Rice Bowl",
        "rice bowl": "Rice Bowl",
        "beverage": "Beverages",
        "beverages": "Beverages",
        "drinks": "Beverages",
        "pasta": "Pasta",
        "sandwich": "Sandwich",
        "sandwiches": "Sandwich",
        "pizza": "Pizza",
        "starters": "Starters",
        "starter": "Starters",
        "biryani": "Biryani",
        "desert": "Desert",
        "dessert": "Desert",
        "extras": "Extras",
        "fish": "Fish",
        "snacks": "Other Snacks",
        "other snacks": "Other Snacks",
        "salad": "Salad",
        "seafood": "Seafood",
        "soup": "Soup"
    }
    return mapping.get(cat_str, raw_cat.strip())

def predict_demand(payload: Dict[str, Any], model=None) -> Dict[str, Any]:
    meta = MODEL_METADATA.get('demand', {})
    model_status = meta.get('status', 'EXTERNAL_DATA_MODEL')
    model_version = meta.get('version', '1.0.0')
    metrics_info = meta.get('metrics', {
        'MAE': 92.1543,
        'RMSE': 224.9484,
        'R2': 0.5874,
        'WAPE': 38.2215,
        'sMAPE': 45.3712
    })
    
    if meta.get('status') == 'insufficient_data' or not meta.get('modelReady', True):
        return {
            'prediction': None,
            'expected_meals': None,
            'modelReady': False,
            'modelStatus': 'EXTERNAL_DATA_MODEL',
            'modelVersion': model_version,
            'metrics': metrics_info,
            'uncertainty': 'Prediction uncertainty is not calibrated.',
            'dataSource': 'Kaggle Food Demand Forecasting',
            'foodBridgeTrained': False,
            'insufficientData': True,
            'missingFeatures': [],
            'message': 'Insufficient real FoodBridge historical demand data.'
        }

    # Extract FoodBridge input fields without artificial default injections
    raw_category = payload.get('food_category') or payload.get('foodCategory') or payload.get('category')
    raw_center_type = payload.get('center_type') or payload.get('centerType')
    raw_op_area = payload.get('op_area') or payload.get('opArea')
    raw_prev_donations = payload.get('previous_donations') or payload.get('previousDonations') or payload.get('historical_demand') or payload.get('historicalDemand')
    raw_week = payload.get('week')

    missing_features = []
    
    category = normalize_category(raw_category) if raw_category else None
    if not category:
        missing_features.append('food_category')

    center_type = str(raw_center_type).upper() if raw_center_type else None
    if not center_type or center_type not in ["TYPE_A", "TYPE_B", "TYPE_C"]:
        missing_features.append('center_type')

    op_area = None
    if raw_op_area is not None:
        try:
            op_area = float(raw_op_area)
        except (ValueError, TypeError):
            missing_features.append('op_area')
    else:
        missing_features.append('op_area')

    prev_donations = None
    if raw_prev_donations is not None:
        try:
            prev_donations = float(raw_prev_donations)
        except (ValueError, TypeError):
            missing_features.append('previous_donations')
    else:
        missing_features.append('previous_donations')

    week = None
    if raw_week is not None:
        try:
            week = int(raw_week)
        except (ValueError, TypeError):
            pass
    
    if week is None:
        week = datetime.now().isocalendar()[1]

    if missing_features:
        logger.info(f"Demand prediction INSUFFICIENT_DATA: missing {missing_features}")
        return {
            'prediction': None,
            'expected_meals': None,
            'modelReady': False,
            'modelStatus': 'EXTERNAL_DATA_MODEL',
            'modelVersion': model_version,
            'metrics': metrics_info,
            'uncertainty': 'Prediction uncertainty is not calibrated.',
            'dataSource': 'Kaggle Food Demand Forecasting',
            'foodBridgeTrained': False,
            'insufficientData': True,
            'missingFeatures': missing_features,
            'message': f"Insufficient real FoodBridge historical demand data. Missing features: {', '.join(missing_features)}."
        }

    if model is not None and hasattr(model, 'predict'):
        lag_1 = float(prev_donations)
        rolling_3_mean = float(prev_donations)

        X = pd.DataFrame([{
            'category': category,
            'center_type': center_type,
            'week': week,
            'op_area': op_area,
            'lag_1': lag_1,
            'rolling_3_mean': rolling_3_mean
        }])

        try:
            pred = float(model.predict(X)[0])
            expected_meals = float(round(max(0.0, pred), 2))
            
            return {
                'prediction': expected_meals,
                'expected_meals': expected_meals,
                'modelReady': True,
                'modelStatus': 'EXTERNAL_DATA_MODEL',
                'modelVersion': model_version,
                'metrics': {
                    'mae': metrics_info.get('MAE', 92.1543),
                    'rmse': metrics_info.get('RMSE', 224.9484),
                    'r2': metrics_info.get('R2', 0.5874),
                    'wape': metrics_info.get('WAPE', 38.2215),
                    'smape': metrics_info.get('sMAPE', 45.3712)
                },
                'uncertainty': 'Prediction uncertainty is not calibrated.',
                'dataSource': 'Kaggle Food Demand Forecasting',
                'foodBridgeTrained': False,
                'insufficientData': False,
                'missingFeatures': None,
                'message': 'Demand forecast calculated from public food-demand model (Kaggle).'
            }
        except Exception as err:
            logger.error(f"Inference error during demand prediction: {err}")
            raise RuntimeError(f"PREDICTION_ERROR: {str(err)}")
    else:
        logger.error("Demand model UNAVAILABLE during inference")
        raise RuntimeError("MODEL_UNAVAILABLE: Demand prediction model is not loaded.")
