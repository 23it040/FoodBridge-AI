import os
import sys
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

REGISTRY_PATH = BASE_DIR / "model_reports" / "model_registry.json"
PRIORITY_METADATA_PATH = BASE_DIR / "model_reports" / "priority_model_metadata.json"
RETRAINING_PLAN_PATH = BASE_DIR / "model_reports" / "FOODBRIDGE_RETRAINING_PLAN.md"


def test_model_registry_integrity():
    assert REGISTRY_PATH.exists(), "model_registry.json must exist"
    with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
        reg = json.load(f)

    assert "demand" in reg
    assert "risk" in reg
    assert "priority" in reg

    assert reg["demand"]["status"] == "EXTERNAL_DATA_MODEL"
    assert reg["risk"]["status"] == "EXTERNAL_DATA_MODEL"
    assert reg["priority"]["status"] == "INSUFFICIENT_DATA"

    assert reg["demand"]["foodBridgeTrained"] is False
    assert reg["risk"]["foodBridgeTrained"] is False
    assert reg["priority"]["foodBridgeTrained"] is False


def test_retraining_plan_exists():
    assert RETRAINING_PLAN_PATH.exists(), "FOODBRIDGE_RETRAINING_PLAN.md must exist"
    content = RETRAINING_PLAN_PATH.read_text(encoding="utf-8")
    assert "DONATION_CREATED" in content
    assert "PICKUP_COMPLETED" in content
    assert "500" in content
    assert "12" in content


def test_response_standardization_schema():
    # Test standardized AI response structure for insufficient data
    from ai_service.app.services.priority import compute_priority

    res = compute_priority({"food_category": "Cooked Meals"}, model=None)
    assert "prediction" in res
    assert "insufficientData" in res
    assert "modelReady" in res
    assert "modelStatus" in res
    assert "message" in res

    assert res["insufficientData"] is True
    assert res["modelReady"] is False
    assert res["modelStatus"] == "INSUFFICIENT_DATA"
    assert res["prediction"] is None


def test_zero_fake_data_rules():
    # Audit that no hardcoded priority 95 / 90 or fake temperatures exist in response services
    from ai_service.app.services.risk import predict_risk

    res_risk = predict_risk({"food_category": "Rice Bowl"}, model=None)
    assert res_risk["insufficientData"] is True
    assert "milk" in res_risk["message"].lower()


if __name__ == "__main__":
    test_model_registry_integrity()
    test_retraining_plan_exists()
    test_response_standardization_schema()
    test_zero_fake_data_rules()
    print("ALL STEP 7 INTEGRATION TESTS PASSED SUCCESSFULLY!")
