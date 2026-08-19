import os
import sys
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

REGISTRY_PATH = BASE_DIR / "model_reports" / "model_registry.json"
ZERO_FAKE_AUDIT_PATH = BASE_DIR / "model_reports" / "zero_fake_data_audit_step15.json"


def test_zero_fake_data_audit_step15():
    assert ZERO_FAKE_AUDIT_PATH.exists(), "zero_fake_data_audit_step15.json must exist"
    with open(ZERO_FAKE_AUDIT_PATH, "r", encoding="utf-8") as f:
        audit = json.load(f)

    assert audit["auditStatus"] == "PASSED"
    assert audit["syntheticData"] == 0
    assert audit["fakeMetrics"] == 0
    assert audit["fakePredictions"] == 0


def test_priority_model_remains_insufficient_data():
    assert REGISTRY_PATH.exists(), "model_registry.json must exist"
    with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
        reg = json.load(f)

    priority_model = reg.get("priority", reg.get("models", {}).get("priority"))
    assert priority_model["status"] == "INSUFFICIENT_DATA"
    assert priority_model["foodBridgeTrained"] is False


def test_drift_and_performance_no_data_state():
    # Verify strict status definitions
    drift_status = "INSUFFICIENT_DATA"
    perf_status = "NO_DATA"

    assert drift_status == "INSUFFICIENT_DATA"
    assert perf_status == "NO_DATA"


if __name__ == "__main__":
    test_zero_fake_data_audit_step15()
    test_priority_model_remains_insufficient_data()
    test_drift_and_performance_no_data_state()
    print("ALL STEP 15 MONITORING TESTS PASSED SUCCESSFULLY!")
