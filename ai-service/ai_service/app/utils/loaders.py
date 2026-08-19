import os
import json
import logging
from joblib import load
from pathlib import Path
from typing import Dict, Any

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_DIR = Path(os.getenv('MODEL_DIR', str(BASE_DIR / 'saved_models')))
REGISTRY_PATH = BASE_DIR / 'model_reports' / 'model_registry.json'

MODELS: Dict[str, Any] = {}
MODEL_METADATA: Dict[str, Any] = {}

logger = logging.getLogger("ai_service")

async def load_models_on_startup():
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    registry = {}
    if REGISTRY_PATH.exists():
        try:
            with open(REGISTRY_PATH, 'r', encoding='utf-8') as f:
                registry = json.load(f)
        except Exception as err:
            logger.error(f"Error reading model registry: {err}")

    mapping = {
        'demand': os.getenv('DEMAND_MODEL_NAME', 'demand_model.joblib'),
        'priority': os.getenv('PRIORITY_MODEL_NAME', 'priority_model.joblib'),
        'risk': os.getenv('RISK_MODEL_NAME', 'risk_model.joblib'),
        'recommender': os.getenv('RECOMMENDER_MODEL_NAME', 'recommender_model.joblib')
    }

    for key, fname in mapping.items():
        reg_info = registry.get(key, {})
        reg_status = reg_info.get('status', 'insufficient_data')

        if reg_status != 'production_ready':
            MODELS[key] = None
            MODEL_METADATA[key] = {
                "status": reg_status,
                "modelReady": False,
                "message": reg_info.get('message', 'Insufficient real historical data for model training.')
            }
            logger.info(f"Model {key} marked '{reg_status}' in registry. ML inference disabled until validated models exist.")
            continue

        path = MODEL_DIR / fname
        if path.exists():
            try:
                MODELS[key] = load(path)
                MODEL_METADATA[key] = {
                    "status": "production_ready",
                    "modelReady": True,
                    "version": reg_info.get('version', '1.0.0'),
                    "file": fname,
                    "loaded": True
                }
                logger.info(f"Loaded production-ready model: {key} ({fname})")
            except Exception as err:
                logger.error(f"Failed to load model {key} ({fname}): {err}")
                MODELS[key] = None
                MODEL_METADATA[key] = {"status": "validation_failed", "modelReady": False, "error": str(err)}
        else:
            MODELS[key] = None
            MODEL_METADATA[key] = {"status": "not_found", "modelReady": False}
