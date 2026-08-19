import os
import sys
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

REGISTRY_PATH = BASE_DIR / "model_reports" / "model_registry.json"
ZERO_FAKE_AUDIT_PATH = BASE_DIR / "model_reports" / "zero_fake_data_audit_step10.json"


def test_decision_engine_registry_alignment():
    assert REGISTRY_PATH.exists(), "model_registry.json must exist"
    with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
        reg = json.load(f)

    assert "demand" in reg
    assert "risk" in reg
    assert "priority" in reg

    assert reg["demand"]["status"] == "EXTERNAL_DATA_MODEL"
    assert reg["risk"]["status"] == "EXTERNAL_DATA_MODEL"
    assert reg["priority"]["status"] == "INSUFFICIENT_DATA"


def test_zero_fake_data_audit_step10_report():
    assert ZERO_FAKE_AUDIT_PATH.exists(), "zero_fake_data_audit_step10.json must exist"
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


if __name__ == "__main__":
    test_decision_engine_registry_alignment()
    test_zero_fake_data_audit_step10_report()
    test_priority_insufficient_data_behavior()
    test_risk_scope_protection()
    print("ALL STEP 10 DECISION ENGINE TESTS PASSED SUCCESSFULLY!")
