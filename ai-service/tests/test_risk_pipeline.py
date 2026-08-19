import os
import sys
import json
import joblib
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
from ai_service.app.services.risk import predict_risk

DATASET_PATH = BASE_DIR / "datasets" / "milknew.csv"
DATA_REPORT_PATH = BASE_DIR / "data_reports" / "risk_dataset_report.json"
COMPATIBILITY_PATH = BASE_DIR / "model_reports" / "risk_feature_compatibility.json"
METRICS_PATH = BASE_DIR / "model_reports" / "risk_metrics.json"
METADATA_PATH = BASE_DIR / "model_reports" / "risk_model_metadata.json"
IMPORTANCE_PATH = BASE_DIR / "model_reports" / "risk_feature_importance.json"
MODEL_PATH = BASE_DIR / "saved_models" / "risk_model.joblib"


def test_dataset_exists_and_audit():
    assert DATASET_PATH.exists(), "milknew.csv dataset must exist"
    assert DATA_REPORT_PATH.exists(), "risk_dataset_report.json must exist"
    with open(DATA_REPORT_PATH, "r", encoding="utf-8") as f:
        audit = json.load(f)
    assert audit["datasetName"] == "Milk Quality Dataset"
    assert audit["numberOfRows"] == 1059
    assert audit["missingValues"] == 0
    assert "low" in audit["uniqueClasses"]


def test_feature_compatibility_report():
    assert COMPATIBILITY_PATH.exists(), "risk_feature_compatibility.json must exist"
    with open(COMPATIBILITY_PATH, "r", encoding="utf-8") as f:
        comp = json.load(f)
    assert comp["modelScope"] == "Milk quality classification"
    assert comp["features"]["pH"]["status"] == "INCOMPATIBLE"
    assert comp["features"]["temperature"]["status"] == "INCOMPATIBLE"


def test_model_metrics_and_selection():
    assert METRICS_PATH.exists(), "risk_metrics.json must exist"
    with open(METRICS_PATH, "r", encoding="utf-8") as f:
        metrics = json.load(f)
    assert metrics["modelScope"] == "Milk quality classification"
    assert metrics["selectedModel"] == "random_forest"
    assert metrics["selectedModelMetrics"]["test"]["accuracy"] >= 0.95


def test_feature_importance_report():
    assert IMPORTANCE_PATH.exists(), "risk_feature_importance.json must exist"
    with open(IMPORTANCE_PATH, "r", encoding="utf-8") as f:
        imp = json.load(f)
    assert imp["model"] == "random_forest"
    assert len(imp["featureImportance"]) == 7
    assert imp["featureImportance"][0]["feature"] == "pH"


def test_model_metadata_report():
    assert METADATA_PATH.exists(), "risk_model_metadata.json must exist"
    with open(METADATA_PATH, "r", encoding="utf-8") as f:
        meta = json.load(f)
    assert meta["modelName"] == "Milk Quality Risk Model"
    assert meta["status"] == "EXTERNAL_DATA_MODEL"
    assert meta["foodBridgeTrained"] is False
    assert meta["scope"] == "Milk quality classification"


def test_model_serialization_and_inference():
    assert MODEL_PATH.exists(), "risk_model.joblib model must exist"
    model = joblib.load(MODEL_PATH)
    assert hasattr(model, "predict")

    # Valid Milk Sensor Input
    valid_payload = {
        "food_category": "milk",
        "ph": 6.6,
        "temperature": 35.0,
        "taste": 1,
        "odor": 0,
        "fat": 1,
        "turbidity": 0,
        "color": 254
    }
    res = predict_risk(valid_payload, model=model)
    assert res["insufficientData"] is False
    assert res["modelReady"] is True
    assert res["prediction"] in ["low", "medium", "high"]
    assert res["riskLevel"] in ["HIGH_RISK", "MEDIUM_RISK", "LOW_RISK"]
    assert res["modelStatus"] == "EXTERNAL_DATA_MODEL"
    assert res["foodBridgeTrained"] is False


def test_category_protection_non_milk():
    model = joblib.load(MODEL_PATH)
    non_milk_payload = {
        "food_category": "Rice Bowl",
        "ph": 6.6,
        "temperature": 35.0,
        "taste": 1,
        "odor": 0,
        "fat": 1,
        "turbidity": 0,
        "color": 254
    }
    res = predict_risk(non_milk_payload, model=model)
    assert res["insufficientData"] is True
    assert res["modelReady"] is False
    assert "milk quality" in res["message"].lower()


def test_missing_features_handling():
    model = joblib.load(MODEL_PATH)
    incomplete_payload = {
        "food_category": "milk",
        "ph": 6.6,
        "temperature": 35.0
        # Missing taste, odor, fat, turbidity, color
    }
    res = predict_risk(incomplete_payload, model=model)
    assert res["insufficientData"] is True
    assert res["modelReady"] is False
    assert res["prediction"] is None
    assert "taste" in res["missingFeatures"]
    assert "odor" in res["missingFeatures"]


def test_normal_foodbridge_donation_missing_all_sensors():
    model = joblib.load(MODEL_PATH)
    donation_payload = {
        "food_category": "Cooked Meals"
    }
    res = predict_risk(donation_payload, model=model)
    assert res["insufficientData"] is True
    assert res["modelReady"] is False
    assert res["prediction"] is None
    assert res["foodBridgeTrained"] is False


if __name__ == "__main__":
    test_dataset_exists_and_audit()
    test_feature_compatibility_report()
    test_model_metrics_and_selection()
    test_feature_importance_report()
    test_model_metadata_report()
    test_model_serialization_and_inference()
    test_category_protection_non_milk()
    test_missing_features_handling()
    test_normal_foodbridge_donation_missing_all_sensors()
    print("ALL RISK PIPELINE TESTS PASSED SUCCESSFULLY!")
