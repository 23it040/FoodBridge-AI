import logging
from typing import Dict, Any
from ai_service.app.utils.loaders import MODEL_METADATA

logger = logging.getLogger("ai_service")

def compute_priority(payload: Dict[str, Any], model=None) -> Dict[str, Any]:
    meta = MODEL_METADATA.get('priority', {})
    model_status = meta.get('status', 'INSUFFICIENT_DATA')
    model_version = meta.get('version', '1.0.0')

    # Priority model training is blocked until FoodBridge accumulates >= 500 real transaction records
    if model_status == 'INSUFFICIENT_DATA' or not meta.get('modelReady', False) or model is None:
        logger.info("Priority calculation INSUFFICIENT_DATA: FoodBridge historical transaction volume below 500-record threshold.")
        return {
            'prediction': None,
            'priorityScore': None,
            'priorityLevel': None,
            'insufficientData': True,
            'modelReady': False,
            'missingFeatures': [],
            'modelStatus': 'INSUFFICIENT_DATA',
            'modelVersion': model_version,
            'message': 'Insufficient real FoodBridge historical data available for priority prediction (Requires >= 500 records across >= 12 weeks).',
            'dataSource': 'MongoDB FoodBridge Database',
            'foodBridgeTrained': False
        }

    # If model becomes ready after future retraining:
    try:
        import pandas as pd
        X = pd.DataFrame([payload])
        pred = float(model.predict(X)[0])
        score = round(float(max(0.0, min(100.0, pred))), 2)
        return {
            'prediction': score,
            'priorityScore': score,
            'priorityLevel': 'HIGH_PRIORITY' if score >= 75 else 'MEDIUM_PRIORITY' if score >= 40 else 'LOW_PRIORITY',
            'insufficientData': False,
            'modelReady': True,
            'modelStatus': model_status,
            'modelVersion': model_version,
            'message': 'Donation priority evaluated using retrained FoodBridge model.',
            'dataSource': 'MongoDB FoodBridge Database',
            'foodBridgeTrained': True
        }
    except Exception as err:
        logger.error(f"Inference error during priority scoring: {err}")
        raise RuntimeError(f"PREDICTION_ERROR: {str(err)}")
