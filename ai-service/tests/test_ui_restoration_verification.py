import os
import sys
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

ZERO_FAKE_AUDIT_PATH = BASE_DIR / "model_reports" / "zero_fake_data_audit_step17_integration.json"
APP_ROUTES_PATH = BASE_DIR.parent / "frontend" / "src" / "routes" / "AppRoutes.jsx"
LEAFLET_MAP_PATH = BASE_DIR.parent / "frontend" / "src" / "components" / "maps" / "LeafletMap.jsx"


def test_is_ngo_type_error_fixed():
    assert LEAFLET_MAP_PATH.exists(), "LeafletMap.jsx must exist"
    content = LEAFLET_MAP_PATH.read_text(encoding="utf-8")
    assert "isNgoType" not in content, "isNgoType must not remain in LeafletMap.jsx"
    assert "isNgoMarker" in content, "isNgoMarker must be derived cleanly"


def test_original_routes_and_layouts_preserved():
    assert APP_ROUTES_PATH.exists(), "AppRoutes.jsx must exist"
    content = APP_ROUTES_PATH.read_text(encoding="utf-8")
    assert "/donor/dashboard" in content
    assert "/donor/donate" in content
    assert "/ngo/dashboard" in content
    assert "/ngo/nearby" in content
    assert "/admin/dashboard" in content
    assert "/admin/ai-readiness" in content
    assert "/admin/ai-monitoring" in content


def test_zero_fake_data_policy():
    assert ZERO_FAKE_AUDIT_PATH.exists(), "zero_fake_data_audit_step17_integration.json must exist"
    with open(ZERO_FAKE_AUDIT_PATH, "r", encoding="utf-8") as f:
        audit = json.load(f)

    assert audit["auditStatus"] == "PASSED"
    assert audit["syntheticTrainingRows"] == 0
    assert audit["fakePredictions"] == 0


if __name__ == "__main__":
    test_is_ngo_type_error_fixed()
    test_original_routes_and_layouts_preserved()
    test_zero_fake_data_policy()
    print("ALL UI RESTORATION CHECKS PASSED SUCCESSFULLY!")
