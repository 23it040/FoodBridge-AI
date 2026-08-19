import os
import sys
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

REGISTRY_PATH = BASE_DIR / "model_reports" / "model_registry.json"
ZERO_FAKE_AUDIT_PATH = BASE_DIR / "model_reports" / "zero_fake_data_audit_step16.json"
DATA_QUALITY_PATH = BASE_DIR / "model_reports" / "production_data_quality_step16.json"
SYSTEM_STATUS_PATH = BASE_DIR / "model_reports" / "ai_system_status_step16.json"


def test_zero_fake_data_audit_step16():
    assert ZERO_FAKE_AUDIT_PATH.exists(), "zero_fake_data_audit_step16.json must exist"
    with open(ZERO_FAKE_AUDIT_PATH, "r", encoding="utf-8") as f:
        audit = json.load(f)

    assert audit["auditStatus"] == "PASSED"
    assert audit["syntheticTrainingRows"] == 0
    assert audit["fakePredictions"] == 0


def test_production_data_quality_report():
    assert DATA_QUALITY_PATH.exists(), "production_data_quality_step16.json must exist"
    with open(DATA_QUALITY_PATH, "r", encoding="utf-8") as f:
        report = json.load(f)

    assert report["dataIntegrityStatus"] == "PASSED_ZERO_CORRUPTION"
    assert report["metrics"]["completedPickups"] == 0


def test_ai_system_status_report():
    assert SYSTEM_STATUS_PATH.exists(), "ai_system_status_step16.json must exist"
    with open(SYSTEM_STATUS_PATH, "r", encoding="utf-8") as f:
        status = json.load(f)

    assert status["implementationStatus"] == "COMPLETE"
    assert status["modelStatuses"]["priority"]["status"] == "INSUFFICIENT_DATA"
    assert status["modelStatuses"]["demand"]["status"] == "EXTERNAL_DATA_MODEL"
    assert status["modelStatuses"]["risk"]["status"] == "EXTERNAL_DATA_MODEL"
    assert status["modelStatuses"]["recommendation"]["status"] == "LIVE_RULE_BASED"
    assert status["modelStatuses"]["route"]["status"] == "LIVE_ALGORITHMIC"
    assert status["productionPerformance"] == "NO_DATA"
    assert status["driftStatus"] == "INSUFFICIENT_DATA"
    assert status["retrainingStatus"] == "NOT_READY"


if __name__ == "__main__":
    test_zero_fake_data_audit_step16()
    test_production_data_quality_report()
    test_ai_system_status_report()
    print("ALL STEP 16 END-TO-END TESTS PASSED SUCCESSFULLY!")
