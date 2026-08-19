import os
import sys
import json
import joblib
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
from ai_service.app.services.demand import predict_demand

DATA_REPORT_PATH = BASE_DIR / "data_reports" / "demand_dataset_report.json"
COMPATIBILITY_PATH = BASE_DIR / "model_reports" / "demand_feature_compatibility.json"
METRICS_PATH = BASE_DIR / "model_reports" / "demand_metrics.json"
METADATA_PATH = BASE_DIR / "model_reports" / "demand_model_metadata.json"
IMPORTANCE_PATH = BASE_DIR / "model_reports" / "demand_feature_importance.json"
RETRAINING_PLAN_PATH = BASE_DIR / "model_reports" / "FOODBRIDGE_RETRAINING_PLAN.md"
MODEL_PATH = BASE_DIR / "saved_models" / "demand_model.joblib"


def test_data_quality_audit_report():
    assert DATA_REPORT_PATH.exists(), "Dataset audit report must exist"
    with open(DATA_REPORT_PATH, "r", encoding="utf-8") as f:
        audit = json.load(f)
    assert audit["datasetName"] == "Food Demand Forecasting"
    assert audit["synthetic"] is False
    assert audit["rawRows"] == 456548
    assert audit["duplicateRows"] == 0
    assert audit["target"] == "num_orders"
    assert "Rice Bowl" in audit["uniqueCategories"]


def test_feature_compatibility_report():
    assert COMPATIBILITY_PATH.exists(), "Feature compatibility report must exist"
    with open(COMPATIBILITY_PATH, "r", encoding="utf-8") as f:
        comp = json.load(f)
    assert "week" in comp["foodBridgeCompatibleFeatures"]
    assert "category" in comp["foodBridgeCompatibleFeatures"]
    assert comp["features"]["checkout_price"]["status"] == "INCOMPATIBLE"


def test_model_metrics_report_and_baseline():
    assert METRICS_PATH.exists(), "Model metrics report must exist"
    with open(METRICS_PATH, "r", encoding="utf-8") as f:
        metrics = json.load(f)
    assert metrics["synthetic"] is False
    assert "gradient_boosting" in metrics["models"]
    assert metrics["selectedModel"] == "gradient_boosting"
    assert "baseline" in metrics
    assert "WAPE" in metrics["testMetrics"]
    assert "sMAPE" in metrics["testMetrics"]
    assert metrics["modelVsBaselineComparison"]["mlOutperformsBaseline"] is True


def test_feature_importance_report():
    assert IMPORTANCE_PATH.exists(), "Feature importance report must exist"
    with open(IMPORTANCE_PATH, "r", encoding="utf-8") as f:
        imp = json.load(f)
    assert imp["model"] == "gradient_boosting"
    assert len(imp["aggregatedFeatureImportance"]) > 0
    top_feature = imp["aggregatedFeatureImportance"][0]["feature"]
    assert top_feature == "lag_1"


def test_retraining_plan_exists():
    assert RETRAINING_PLAN_PATH.exists(), "FoodBridge retraining plan document must exist"


def test_model_metadata_report():
    assert METADATA_PATH.exists(), "Model metadata report must exist"
    with open(METADATA_PATH, "r", encoding="utf-8") as f:
        meta = json.load(f)
    assert meta["synthetic"] is False
    assert meta["FoodBridgeCompatible"] is True
    assert meta["foodBridgeTrained"] is False
    assert meta["status"] == "EXTERNAL_DATA_MODEL"
    assert meta["trainingDataset"] == "Food Demand Forecasting"


def test_standardized_api_response_and_inference():
    assert MODEL_PATH.exists(), "Joblib demand model must exist"
    model = joblib.load(MODEL_PATH)
    assert hasattr(model, "predict")

    from ai_service.app.utils.loaders import MODEL_METADATA
    MODEL_METADATA['demand'] = {
        'status': 'EXTERNAL_DATA_MODEL',
        'modelReady': True,
        'version': '1.0.0',
        'metrics': {'MAE': 92.1543, 'RMSE': 224.9484, 'R2': 0.5874, 'WAPE': 38.2215, 'sMAPE': 45.3712}
    }

    # Test valid input prediction
    valid_payload = {
        "food_category": "Rice Bowl",
        "center_type": "TYPE_A",
        "op_area": 5.0,
        "previous_donations": 150,
        "week": 25
    }
    res = predict_demand(valid_payload, model=model)
    assert res["insufficientData"] is False
    assert res["modelReady"] is True
    assert res["prediction"] is not None
    assert res["expected_meals"] is not None
    assert res["prediction"] > 0
    assert res["modelStatus"] == "EXTERNAL_DATA_MODEL"
    assert res["foodBridgeTrained"] is False
    assert res["uncertainty"] == "Prediction uncertainty is not calibrated."
    assert "wape" in res["metrics"]

    # Test missing input handling (Zero default feature injection rule)
    invalid_payload = {
        "food_category": "Rice Bowl",
    }
    res_invalid = predict_demand(invalid_payload, model=model)
    assert res_invalid["insufficientData"] is True
    assert res_invalid["modelReady"] is False
    assert res_invalid["prediction"] is None
    assert res_invalid["expected_meals"] is None
    assert "center_type" in res_invalid["missingFeatures"]
    assert "op_area" in res_invalid["missingFeatures"]
    assert "previous_donations" in res_invalid["missingFeatures"]


if __name__ == "__main__":
    test_data_quality_audit_report()
    test_feature_compatibility_report()
    test_model_metrics_report_and_baseline()
    test_feature_importance_report()
    test_retraining_plan_exists()
    test_model_metadata_report()
    test_standardized_api_response_and_inference()
    print("ALL DEMAND PIPELINE TESTS PASSED SUCCESSFULLY!")
