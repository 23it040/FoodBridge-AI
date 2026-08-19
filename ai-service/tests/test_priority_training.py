import os
import sys
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from training.train_priority_model import train_priority_model
from ai_service.app.services.priority import compute_priority

LEAKAGE_AUDIT_PATH = BASE_DIR / "model_reports" / "priority_leakage_audit.json"
DATASET_REPORT_PATH = BASE_DIR / "data_reports" / "priority_dataset_report.json"
METADATA_PATH = BASE_DIR / "model_reports" / "priority_model_metadata.json"
REGISTRY_PATH = BASE_DIR / "model_reports" / "model_registry.json"


def test_priority_training_gate_blocking():
    # Verify Phase 2 readiness gate blocks training when records < 500
    res = train_priority_model()
    assert res["status"] == "INSUFFICIENT_DATA"
    assert res["trainingStarted"] is False
    assert res["recordsAvailable"] == 0
    assert res["weeksAvailable"] == 0
    assert res["requiredRecords"] == 500
    assert res["requiredWeeks"] == 12


def test_dataset_report_integrity():
    assert DATASET_REPORT_PATH.exists(), "priority_dataset_report.json must exist"
    with open(DATASET_REPORT_PATH, "r", encoding="utf-8") as f:
        report = json.load(f)
    assert report["dataSource"] == "FoodBridge MongoDB"
    assert report["syntheticRows"] == 0
    assert report["externalRows"] == 0
    assert report["readinessStatus"] == "INSUFFICIENT_DATA"


def test_leakage_audit_integrity():
    assert LEAKAGE_AUDIT_PATH.exists(), "priority_leakage_audit.json must exist"
    with open(LEAKAGE_AUDIT_PATH, "r", encoding="utf-8") as f:
        audit = json.load(f)
    assert audit.get("status", audit.get("leakageAuditStatus")) == "PASSED_STRICT_FILTER"
    assert audit.get("leakageViolations", 0) == 0
    rejected = [item["feature"] for item in audit["featureAudit"] if item["leakageDetected"]]
    assert "pickup_completed_timestamp" in rejected
    assert "future_acceptance_status" in rejected


def test_model_metadata_and_registry_status():
    assert METADATA_PATH.exists(), "priority_model_metadata.json must exist"
    with open(METADATA_PATH, "r", encoding="utf-8") as f:
        meta = json.load(f)
    assert meta["status"] == "INSUFFICIENT_DATA"
    assert meta["foodBridgeTrained"] is False

    with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
        reg = json.load(f)
    assert reg["priority"]["status"] == "INSUFFICIENT_DATA"
    assert reg["priority"]["foodBridgeTrained"] is False


def test_service_zero_fake_data_response():
    # Verify that compute_priority returns insufficientData cleanly without fake scores or defaults
    res = compute_priority({"food_category": "Rice Bowl"}, model=None)
    assert res["insufficientData"] is True
    assert res["modelReady"] is False
    assert res["prediction"] is None
    assert res["priorityScore"] is None
    assert res["modelStatus"] == "INSUFFICIENT_DATA"
    assert res["foodBridgeTrained"] is False
    assert "Insufficient real FoodBridge historical data" in res["message"]


if __name__ == "__main__":
    test_priority_training_gate_blocking()
    test_dataset_report_integrity()
    test_leakage_audit_integrity()
    test_model_metadata_and_registry_status()
    test_service_zero_fake_data_response()
    print("ALL PRIORITY TRAINING TESTS PASSED SUCCESSFULLY!")
