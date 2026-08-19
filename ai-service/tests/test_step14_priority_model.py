import os
import sys
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

REGISTRY_PATH = BASE_DIR / "model_reports" / "model_registry.json"
DATASET_REPORT_PATH = BASE_DIR / "data_reports" / "priority_dataset_report_step14.json"
LEAKAGE_AUDIT_PATH = BASE_DIR / "model_reports" / "priority_leakage_audit_step14.json"
FEAT_IMP_PATH = BASE_DIR / "model_reports" / "priority_feature_importance.json"
ZERO_FAKE_AUDIT_PATH = BASE_DIR / "model_reports" / "zero_fake_data_audit_step14.json"


def test_step14_readiness_gate_and_training_execution():
    from training.train_priority_model import train_priority_model

    res = train_priority_model()
    assert res["status"] == "INSUFFICIENT_DATA"
    assert res["trainingStarted"] is False
    assert res["modelReady"] is False
    assert res["foodBridgeTrained"] is False
    assert res["recordsAvailable"] == 0
    assert res["requiredRecords"] == 500


def test_step14_temporal_leakage_audit_report():
    assert LEAKAGE_AUDIT_PATH.exists(), "priority_leakage_audit_step14.json must exist"
    with open(LEAKAGE_AUDIT_PATH, "r", encoding="utf-8") as f:
        audit = json.load(f)

    assert audit["status"] == "PASSED_STRICT_FILTER"
    assert audit["leakageViolations"] == 0
    assert len(audit["featureAudit"]) >= 4


def test_step14_dataset_quality_report():
    assert DATASET_REPORT_PATH.exists(), "priority_dataset_report_step14.json must exist"
    with open(DATASET_REPORT_PATH, "r", encoding="utf-8") as f:
        rep = json.load(f)

    assert rep["syntheticRows"] == 0
    assert rep["dataSource"] == "FoodBridge MongoDB"
    assert rep["readinessStatus"] == "INSUFFICIENT_DATA"


def test_step14_feature_importance_report():
    assert FEAT_IMP_PATH.exists(), "priority_feature_importance.json must exist"
    with open(FEAT_IMP_PATH, "r", encoding="utf-8") as f:
        imp = json.load(f)

    assert imp["status"] == "INSUFFICIENT_DATA"
    assert imp["modelTrained"] is False


def test_step14_zero_fake_data_audit_report():
    assert ZERO_FAKE_AUDIT_PATH.exists(), "zero_fake_data_audit_step14.json must exist"
    with open(ZERO_FAKE_AUDIT_PATH, "r", encoding="utf-8") as f:
        audit = json.load(f)

    assert audit["auditStatus"] == "PASSED"
    assert audit["syntheticTrainingRows"] == 0
    assert audit["fakePriorityPredictions"] == 0
    assert audit["hardcodedPriorityScores"] == 0


def test_priority_model_registry_status():
    assert REGISTRY_PATH.exists(), "model_registry.json must exist"
    with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
        reg = json.load(f)

    priority_model = reg.get("priority", reg.get("models", {}).get("priority"))
    assert priority_model["status"] == "INSUFFICIENT_DATA"
    assert priority_model["foodBridgeTrained"] is False


if __name__ == "__main__":
    test_step14_readiness_gate_and_training_execution()
    test_step14_temporal_leakage_audit_report()
    test_step14_dataset_quality_report()
    test_step14_feature_importance_report()
    test_step14_zero_fake_data_audit_report()
    test_priority_model_registry_status()
    print("ALL STEP 14 PRIORITY MODEL TRAINING TESTS PASSED SUCCESSFULLY!")
