import os
import sys
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

REGISTRY_PATH = BASE_DIR / "model_reports" / "model_registry.json"
INTEGRATION_ZERO_FAKE_AUDIT_PATH = BASE_DIR / "model_reports" / "zero_fake_data_audit_step17_integration.json"


def test_zero_fake_data_audit_step17_integration():
    assert INTEGRATION_ZERO_FAKE_AUDIT_PATH.exists(), "zero_fake_data_audit_step17_integration.json must exist"
    with open(INTEGRATION_ZERO_FAKE_AUDIT_PATH, "r", encoding="utf-8") as f:
        audit = json.load(f)

    assert audit["auditStatus"] == "PASSED"
    assert audit["syntheticTrainingRows"] == 0
    assert audit["fakePredictions"] == 0


def test_full_system_governance_truthful_state():
    assert REGISTRY_PATH.exists(), "model_registry.json must exist"
    with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
        reg = json.load(f)

    demand = reg.get("demand", {})
    risk = reg.get("risk", {})
    priority = reg.get("priority", {})

    assert demand["status"] == "EXTERNAL_DATA_MODEL"
    assert demand["foodBridgeTrained"] is False

    assert risk["status"] == "EXTERNAL_DATA_MODEL"
    assert risk["foodBridgeTrained"] is False

    assert priority["status"] == "INSUFFICIENT_DATA"
    assert priority["foodBridgeTrained"] is False


if __name__ == "__main__":
    test_zero_fake_data_audit_step17_integration()
    test_full_system_governance_truthful_state()
    print("ALL STEP 17 FULL SYSTEM INTEGRATION TESTS PASSED SUCCESSFULLY!")
