import os
import sys
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

REGISTRY_PATH = BASE_DIR / "model_reports" / "model_registry.json"
MONITORING_PATH = BASE_DIR / "model_reports" / "priority_data_collection_monitoring.json"
ZERO_FAKE_AUDIT_PATH = BASE_DIR / "model_reports" / "zero_fake_data_audit_step13.json"
LIFECYCLE_AUDIT_PATH = BASE_DIR / "model_reports" / "lifecycle_events_audit.json"


def test_lifecycle_events_audit_tool():
    from training.audit_lifecycle_events import audit_lifecycle_events

    mock_events = [
        {"donationId": "don_1", "eventType": "DONATION_CREATED", "timestamp": "2026-08-14T10:00:00Z"},
        {"donationId": "don_1", "requestId": "req_1", "eventType": "REQUEST_CREATED", "timestamp": "2026-08-14T10:30:00Z"},
        {"donationId": "don_1", "requestId": "req_1", "eventType": "PICKUP_COMPLETED", "timestamp": "2026-08-14T11:30:00Z"}
    ]

    res = audit_lifecycle_events(mock_events)
    assert res["status"] == "PASSED"
    assert res["totalEvents"] == 3
    assert res["duplicateEvents"] == 0
    assert res["invalidReferences"] == 0


def test_priority_data_collection_monitoring():
    assert MONITORING_PATH.exists(), "priority_data_collection_monitoring.json must exist"
    with open(MONITORING_PATH, "r", encoding="utf-8") as f:
        mon = json.load(f)

    assert mon["totalDonations"] == 0
    assert mon["totalRequests"] == 0
    assert mon["readinessStatus"] == "INSUFFICIENT_DATA"


def test_zero_fake_data_audit_step13():
    assert ZERO_FAKE_AUDIT_PATH.exists(), "zero_fake_data_audit_step13.json must exist"
    with open(ZERO_FAKE_AUDIT_PATH, "r", encoding="utf-8") as f:
        audit = json.load(f)

    assert audit["auditStatus"] == "PASSED"
    assert audit["syntheticRows"] == 0
    assert audit["fakeLifecycleEvents"] == 0
    assert audit["fakePickupTimestamps"] == 0


def test_priority_model_remains_insufficient_data():
    assert REGISTRY_PATH.exists(), "model_registry.json must exist"
    with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
        reg = json.load(f)

    priority_model = reg.get("priority", reg.get("models", {}).get("priority"))
    assert priority_model["status"] == "INSUFFICIENT_DATA"
    assert priority_model["foodBridgeTrained"] is False


if __name__ == "__main__":
    test_lifecycle_events_audit_tool()
    test_priority_data_collection_monitoring()
    test_zero_fake_data_audit_step13()
    test_priority_model_remains_insufficient_data()
    print("ALL STEP 13 DATA COLLECTION TESTS PASSED SUCCESSFULLY!")
