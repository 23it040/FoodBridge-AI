import logging
import pandas as pd
from typing import Dict, Any
from ai_service.app.utils.loaders import MODEL_METADATA

logger = logging.getLogger("ai_service")

MILK_KEYWORDS = ["milk", "dairy", "paneer", "curd", "yogurt", "cheese", "butter"]

def is_milk_category(category_str: str) -> bool:
    if not category_str:
        return False
    cat = str(category_str).strip().lower()
    return any(kw in cat for kw in MILK_KEYWORDS)

def predict_risk(payload: Dict[str, Any], model=None) -> Dict[str, Any]:
    meta = MODEL_METADATA.get('risk', {})
    model_status = meta.get('status', 'EXTERNAL_DATA_MODEL')
    model_version = meta.get('version', '1.0.0')
    metrics_info = meta.get('metrics', {'accuracy': 0.9874, 'f1_macro': 0.9862})

    # Section 17: Food Category Protection
    raw_category = payload.get('food_category') or payload.get('foodCategory') or payload.get('category')
    if raw_category and not is_milk_category(raw_category):
        logger.info(f"Risk prediction category restriction triggered for category: '{raw_category}'")
        return {
            'prediction': None,
            'riskLevel': None,
            'insufficientData': True,
            'modelReady': False,
            'missingFeatures': [],
            'message': 'The current risk model is trained only for milk quality and cannot reliably assess this food category.',
            'modelStatus': 'EXTERNAL_DATA_MODEL',
            'modelVersion': model_version,
            'dataSource': 'Public Milk Quality Dataset',
            'foodBridgeTrained': False
        }

    # Section 16: Required Sensor Data Check (Zero Default Injections)
    ph = payload.get('ph') if payload.get('ph') is not None else payload.get('pH')
    temperature = payload.get('temperature') if payload.get('temperature') is not None else payload.get('temperature_c')
    taste = payload.get('taste')
    odor = payload.get('odor')
    fat = payload.get('fat')
    turbidity = payload.get('turbidity')
    color = payload.get('color') if payload.get('color') is not None else payload.get('colour')

    missing_features = []
    if ph is None: missing_features.append('pH')
    if temperature is None: missing_features.append('temperature')
    if taste is None: missing_features.append('taste')
    if odor is None: missing_features.append('odor')
    if fat is None: missing_features.append('fat')
    if turbidity is None: missing_features.append('turbidity')
    if color is None: missing_features.append('color')

    if missing_features:
        logger.info(f"Risk prediction INSUFFICIENT_DATA: missing features {missing_features}")
        return {
            'prediction': None,
            'riskLevel': None,
            'insufficientData': True,
            'modelReady': False,
            'missingFeatures': missing_features,
            'message': f"Risk prediction unavailable because required physical sensor data ({', '.join(missing_features)}) is not collected by FoodBridge.",
            'modelStatus': 'EXTERNAL_DATA_MODEL',
            'modelVersion': model_version,
            'dataSource': 'Public Milk Quality Dataset',
            'foodBridgeTrained': False
        }

    if model is not None and hasattr(model, 'predict'):
        try:
            X = pd.DataFrame([{
                'pH': float(ph),
                'temperature': float(temperature),
                'taste': int(taste),
                'odor': int(odor),
                'fat': int(fat),
                'turbidity': int(turbidity),
                'color': int(color)
            }])

            pred_class = int(model.predict(X)[0])
            grade_map = {0: 'low', 1: 'medium', 2: 'high'}
            risk_map = {0: 'HIGH_RISK', 1: 'MEDIUM_RISK', 2: 'LOW_RISK'}

            return {
                'prediction': grade_map.get(pred_class, 'unknown'),
                'riskLevel': risk_map.get(pred_class, 'UNKNOWN'),
                'modelReady': True,
                'modelStatus': 'EXTERNAL_DATA_MODEL',
                'modelVersion': model_version,
                'metrics': {
                    'accuracy': metrics_info.get('accuracy', 0.9874),
                    'f1_macro': metrics_info.get('f1_macro', 0.9862)
                },
                'uncertainty': 'Prediction uncertainty is not calibrated.',
                'dataSource': 'Public Milk Quality Dataset',
                'foodBridgeTrained': False,
                'insufficientData': False,
                'missingFeatures': None,
                'message': 'Milk quality risk assessed using public Milk Quality model.'
            }
        except Exception as err:
            logger.error(f"Inference error during risk prediction: {err}")
            raise RuntimeError(f"PREDICTION_ERROR: {str(err)}")
    else:
        logger.error("Risk model UNAVAILABLE during inference")
        raise RuntimeError("MODEL_UNAVAILABLE: Risk prediction model is not loaded.")

risk_score = predict_risk

