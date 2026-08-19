import os
import sys
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

REGISTRY_PATH = BASE_DIR / "model_reports" / "model_registry.json"
ZERO_FAKE_AUDIT_PATH = BASE_DIR / "model_reports" / "zero_fake_data_audit_step17.json"
DATA_AUDIT_PATH = BASE_DIR / "model_reports" / "final_production_data_audit_step17.json"
ARCH_AUDIT_PATH = BASE_DIR / "model_reports" / "final_ai_architecture_audit_step17.json"


def test_zero_fake_data_audit_step17():
    assert ZERO_FAKE_AUDIT_PATH.exists(), "zero_fake_data_audit_step17.json must exist"
    with open(ZERO_FAKE_AUDIT_PATH, "r", encoding="utf-8") as f:
        audit = json.load(f)

    assert audit["auditStatus"] == "PASSED"
    assert audit["syntheticTrainingRows"] == 0
    assert audit["fakePredictions"] == 0


def test_final_architecture_audit_report():
    assert ARCH_AUDIT_PATH.exists(), "final_ai_architecture_audit_step17.json must exist"
    with open(ARCH_AUDIT_PATH, "r", encoding="utf-8") as f:
        arch = json.load(f)

    assert arch["architectureStatus"] == "COMPLETE"
    assert arch["securityStatus"] == "ENFORCED_401_403_ADMIN_AUTHENTICATION"
    assert len(arch["capabilities"]) == 5


def test_final_production_data_audit_report():
    assert DATA_AUDIT_PATH.exists(), "final_production_data_audit_step17.json must exist"
    with open(DATA_AUDIT_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert data["dataQualityIntegrity"]["auditStatus"] == "PASSED_ZERO_CORRUPTION"
    assert data["validAiTrainingRecords"]["validPriorityTrainingRecords"] == 0


def test_model_governance_truthful_state():
    assert REGISTRY_PATH.exists(), "model_registry.json must exist"
    with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
        reg = json.load(f)

    priority_model = reg.get("priority", reg.get("models", {}).get("priority"))
    demand_model = reg.get("demand", reg.get("models", {}).get("demand"))
    risk_model = reg.get("risk", reg.get("models", {}).get("risk"))

    assert priority_model["status"] == "INSUFFICIENT_DATA"
    assert priority_model["foodBridgeTrained"] is False
    assert demand_model["status"] == "EXTERNAL_DATA_MODEL"
    assert risk_model["status"] == "EXTERNAL_DATA_MODEL"


if __name__ == "__main__":
    test_zero_fake_data_audit_step17()
    test_final_architecture_audit_report()
    test_final_production_data_audit_report()
    test_model_governance_truthful_state()
    print("ALL STEP 17 PRODUCTION READINESS TESTS PASSED SUCCESSFULLY!")
