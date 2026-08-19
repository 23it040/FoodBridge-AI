import os
import sys
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
from ai_service.app.services.priority import compute_priority

DATA_REPORT_PATH = BASE_DIR / "data_reports" / "priority_dataset_report.json"
COMPATIBILITY_PATH = BASE_DIR / "model_reports" / "priority_feature_compatibility.json"
METADATA_PATH = BASE_DIR / "model_reports" / "priority_model_metadata.json"
REGISTRY_PATH = BASE_DIR / "model_reports" / "model_registry.json"


def test_priority_dataset_report():
    assert DATA_REPORT_PATH.exists(), "priority_dataset_report.json must exist"
    with open(DATA_REPORT_PATH, "r", encoding="utf-8") as f:
        report = json.load(f)
    assert report.get("recordsAvailable", report.get("validTrainingRecords", 0)) == 0
    assert report.get("minimumRequired", report.get("minimumRecordsRequired", 500)) == 500
    assert report["readinessStatus"] in ["INSUFFICIENT_DATA", "INSUFFICIENT_REAL_FOODBRIDGE_DATA"]


def test_priority_feature_compatibility_report():
    assert COMPATIBILITY_PATH.exists(), "priority_feature_compatibility.json must exist"
    with open(COMPATIBILITY_PATH, "r", encoding="utf-8") as f:
        comp = json.load(f)
    assert comp["dataStatus"] == "INSUFFICIENT_REAL_FOODBRIDGE_DATA"
    assert "food_quantity" in comp["features"]


def test_priority_model_metadata():
    assert METADATA_PATH.exists(), "priority_model_metadata.json must exist"
    with open(METADATA_PATH, "r", encoding="utf-8") as f:
        meta = json.load(f)
    assert meta["modelName"] == "FoodBridge Donation Priority Model"
    assert meta["status"] == "INSUFFICIENT_DATA"
    assert meta["foodBridgeTrained"] is False


def test_priority_model_registry():
    assert REGISTRY_PATH.exists(), "model_registry.json must exist"
    with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
        reg = json.load(f)
    assert "priority" in reg
    assert reg["priority"]["status"] == "INSUFFICIENT_DATA"
    assert reg["priority"]["foodBridgeTrained"] is False


def test_priority_service_insufficient_data_response():
    from ai_service.app.utils.loaders import MODEL_METADATA
    MODEL_METADATA['priority'] = {
        'status': 'INSUFFICIENT_DATA',
        'modelReady': False,
        'version': '1.0.0'
    }

    # Test that compute_priority returns insufficientData cleanly without fake scores
    payload = {"food_category": "Rice Bowl"}
    res = compute_priority(payload, model=None)

    assert res["insufficientData"] is True
    assert res["modelReady"] is False
    assert res["prediction"] is None
    assert res["priorityScore"] is None
    assert res["priorityLevel"] is None
    assert res["modelStatus"] == "INSUFFICIENT_DATA"
    assert res["foodBridgeTrained"] is False
    assert "Insufficient real FoodBridge historical data" in res["message"]


if __name__ == "__main__":
    test_priority_dataset_report()
    test_priority_feature_compatibility_report()
    test_priority_model_metadata()
    test_priority_model_registry()
    test_priority_service_insufficient_data_response()
    print("ALL PRIORITY PIPELINE TESTS PASSED SUCCESSFULLY!")
