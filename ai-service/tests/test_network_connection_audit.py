import os
import sys
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

REGISTRY_PATH = BASE_DIR / "model_reports" / "model_registry.json"
ZERO_FAKE_AUDIT_PATH = BASE_DIR / "model_reports" / "zero_fake_data_audit_step17_integration.json"
DATA_AUDIT_PATH = BASE_DIR / "model_reports" / "final_production_data_audit_step17.json"


def test_network_configuration_audit():
    frontend_env = Path(__file__).resolve().parent.parent.parent / "frontend" / ".env"
    backend_env = Path(__file__).resolve().parent.parent.parent / "backend" / ".env"

    assert frontend_env.exists(), "frontend/.env must exist"
    assert backend_env.exists(), "backend/.env must exist"

    frontend_content = frontend_env.read_text(encoding="utf-8")
    backend_content = backend_env.read_text(encoding="utf-8")

    assert "VITE_API_BASE_URL=http://localhost:5000" in frontend_content
    assert "PORT=5000" in backend_content
    assert "CLIENT_URL=http://localhost:5173" in backend_content
    assert "AI_SERVICE_URL=http://127.0.0.1:8000" in backend_content


def test_zero_fake_data_audit_integration():
    assert ZERO_FAKE_AUDIT_PATH.exists(), "zero_fake_data_audit_step17_integration.json must exist"
    with open(ZERO_FAKE_AUDIT_PATH, "r", encoding="utf-8") as f:
        audit = json.load(f)

    assert audit["auditStatus"] == "PASSED"
    assert audit["syntheticTrainingRows"] == 0


if __name__ == "__main__":
    test_network_configuration_audit()
    test_zero_fake_data_audit_integration()
    print("ALL NETWORK CONNECTION AUDIT CHECKS PASSED SUCCESSFULLY!")
