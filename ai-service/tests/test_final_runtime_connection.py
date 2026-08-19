import os
import sys
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

REGISTRY_PATH = BASE_DIR / "model_reports" / "model_registry.json"
ZERO_FAKE_AUDIT_PATH = BASE_DIR / "model_reports" / "zero_fake_data_audit_step17_integration.json"
NETWORK_AUDIT_PATH = BASE_DIR / "model_reports" / "NETWORK_API_CONNECTION_AUDIT.md"


def test_final_runtime_services_configuration():
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


def test_network_audit_report_exists():
    assert NETWORK_AUDIT_PATH.exists(), "NETWORK_API_CONNECTION_AUDIT.md must exist"
    content = NETWORK_AUDIT_PATH.read_text(encoding="utf-8")
    assert "NETWORK ERROR RESOLVED" in content
    assert "RUNTIME_PASS" in content


def test_truthful_model_governance_registry():
    assert REGISTRY_PATH.exists(), "model_registry.json must exist"
    with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
        reg = json.load(f)

    priority_model = reg.get("priority", reg.get("models", {}).get("priority"))
    assert priority_model["status"] == "INSUFFICIENT_DATA"
    assert priority_model["foodBridgeTrained"] is False


if __name__ == "__main__":
    test_final_runtime_services_configuration()
    test_network_audit_report_exists()
    test_truthful_model_governance_registry()
    print("ALL FINAL RUNTIME CONNECTION CHECKS PASSED SUCCESSFULLY!")
