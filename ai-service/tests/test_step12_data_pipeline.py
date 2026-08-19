import os
import sys
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

REGISTRY_PATH = BASE_DIR / "model_reports" / "model_registry.json"
DATASET_REPORT_PATH = BASE_DIR / "data_reports" / "priority_dataset_report_step12.json"
LEAKAGE_AUDIT_PATH = BASE_DIR / "model_reports" / "priority_leakage_audit_step12.json"
ZERO_FAKE_AUDIT_PATH = BASE_DIR / "model_reports" / "zero_fake_data_audit_step12.json"


def test_is_valid_priority_training_record():
    from training.build_priority_dataset import isValidPriorityTrainingRecord

    # Complete valid record
    valid_rec = {
        "donationId": "don_1",
        "requestId": "req_1",
        "acceptanceTimestamp": "2026-08-14T10:00:00Z",
        "pickupCompletedTimestamp": "2026-08-14T11:00:00Z",
        "donationCreatedTimestamp": "2026-08-14T09:00:00Z",
        "featureTimestamp": "2026-08-14T09:30:00Z",
        "category": "Cooked Meals",
        "quantity": 20,
        "latitude": 28.6139,
        "longitude": 77.2090
    }
    is_valid, reasons = isValidPriorityTrainingRecord(valid_rec)
    assert is_valid is True
    assert len(reasons) == 0

    # Incomplete record missing pickup completion
    invalid_rec = {
        "donationId": "don_2",
        "requestId": "req_2",
        "category": "Rice",
        "quantity": 10
    }
    is_valid_2, reasons_2 = isValidPriorityTrainingRecord(invalid_rec)
    assert is_valid_2 is False
    assert "MISSING_PICKUP_COMPLETION" in reasons_2


def test_step12_dataset_report_and_readiness_gate():
    assert DATASET_REPORT_PATH.exists(), "priority_dataset_report_step12.json must exist"
    with open(DATASET_REPORT_PATH, "r", encoding="utf-8") as f:
        rep = json.load(f)

    assert rep["syntheticRows"] == 0
    assert rep["readinessStatus"] == "INSUFFICIENT_DATA"
    assert rep["minimumRecordsRequired"] == 500
    assert rep["minimumWeeksRequired"] == 12


def test_step12_temporal_leakage_audit():
    assert LEAKAGE_AUDIT_PATH.exists(), "priority_leakage_audit_step12.json must exist"
    with open(LEAKAGE_AUDIT_PATH, "r", encoding="utf-8") as f:
        audit = json.load(f)

    assert audit["status"] == "PASSED_STRICT_FILTER"
    assert audit["leakageViolations"] == 0


def test_step12_zero_fake_data_audit():
    assert ZERO_FAKE_AUDIT_PATH.exists(), "zero_fake_data_audit_step12.json must exist"
    with open(ZERO_FAKE_AUDIT_PATH, "r", encoding="utf-8") as f:
        audit = json.load(f)

    assert audit["auditStatus"] == "PASSED"
    assert audit["syntheticRows"] == 0
    assert audit["fakeTrainingRows"] == 0
    assert audit["fakeTargets"] == 0


def test_priority_training_pipeline_execution():
    from training.train_priority_model import train_priority_model

    res = train_priority_model()
    assert res["status"] == "INSUFFICIENT_DATA"
    assert res["trainingStarted"] is False
    assert res["recordsAvailable"] == 0
    assert res["requiredRecords"] == 500


if __name__ == "__main__":
    test_is_valid_priority_training_record()
    test_step12_dataset_report_and_readiness_gate()
    test_step12_temporal_leakage_audit()
    test_step12_zero_fake_data_audit()
    test_priority_training_pipeline_execution()
    print("ALL STEP 12 TRAINING DATA PIPELINE TESTS PASSED SUCCESSFULLY!")
