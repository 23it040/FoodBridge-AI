import os
import sys
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

REGISTRY_PATH = BASE_DIR / "model_reports" / "model_registry.json"
ZERO_FAKE_AUDIT_PATH = BASE_DIR / "model_reports" / "zero_fake_data_audit_step9.json"


def test_capabilities_registry_alignment():
    assert REGISTRY_PATH.exists(), "model_registry.json must exist"
    with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
        reg = json.load(f)

    assert "demand" in reg
    assert "risk" in reg
    assert "priority" in reg

    assert reg["demand"]["status"] == "EXTERNAL_DATA_MODEL"
    assert reg["risk"]["status"] == "EXTERNAL_DATA_MODEL"
    assert reg["priority"]["status"] == "INSUFFICIENT_DATA"


def test_zero_fake_data_audit_report():
    assert ZERO_FAKE_AUDIT_PATH.exists(), "zero_fake_data_audit_step9.json must exist"
    with open(ZERO_FAKE_AUDIT_PATH, "r", encoding="utf-8") as f:
        audit = json.load(f)

    assert audit["auditStatus"] == "PASSED"
    assert audit["syntheticTrainingRows"] == 0
    assert audit["fakeNGOs"] == 0
    assert audit["fakePredictions"] == 0
    assert audit["defaultPredictionInputs"] == 0
    assert audit["hardcodedAIValues"] == 0


def test_priority_insufficient_data_behavior():
    from ai_service.app.services.priority import compute_priority

    res = compute_priority({"food_category": "Rice Bowl"}, model=None)
    assert res["insufficientData"] is True
    assert res["modelReady"] is False
    assert res["prediction"] is None
    assert res["modelStatus"] == "INSUFFICIENT_DATA"
    assert res["foodBridgeTrained"] is False


def test_risk_scope_protection():
    from ai_service.app.services.risk import predict_risk

    # Non-milk category should return insufficientData
    res_non_milk = predict_risk({"food_category": "Cooked Meals"}, model=None)
    assert res_non_milk["insufficientData"] is True
    assert "milk quality" in res_non_milk["message"].lower()

    # Milk category with valid sensors should return model prediction
    valid_milk = {
        "food_category": "milk",
        "ph": 6.6,
        "temperature": 35.0,
        "taste": 1,
        "odor": 0,
        "fat": 1,
        "turbidity": 0,
        "color": 254
    }
    import joblib
    model_path = BASE_DIR / "saved_models" / "risk_model.joblib"
    model = joblib.load(model_path) if model_path.exists() else None

    res_milk = predict_risk(valid_milk, model=model)
    assert res_milk["insufficientData"] is False
    assert res_milk["modelReady"] is True
    assert res_milk["prediction"] in ["low", "medium", "high"]


if __name__ == "__main__":
    test_capabilities_registry_alignment()
    test_zero_fake_data_audit_report()
    test_priority_insufficient_data_behavior()
    test_risk_scope_protection()
    print("ALL STEP 9 OPERATIONAL INTELLIGENCE TESTS PASSED SUCCESSFULLY!")
