import os
import sys
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

RULES_PATH = BASE_DIR / "model_reports" / "recommendation_rules.json"
ZERO_FAKE_AUDIT_PATH = BASE_DIR / "model_reports" / "zero_fake_data_audit_step11.json"


def test_recommendation_rules_json_alignment():
    assert RULES_PATH.exists(), "recommendation_rules.json must exist"
    with open(RULES_PATH, "r", encoding="utf-8") as f:
        rules = json.load(f)

    assert rules["modelType"] == "RULE_BASED"
    assert rules["status"] == "LIVE_RULE_BASED"
    assert len(rules["factors"]) >= 5


def test_zero_fake_data_audit_step11_report():
    assert ZERO_FAKE_AUDIT_PATH.exists(), "zero_fake_data_audit_step11.json must exist"
    with open(ZERO_FAKE_AUDIT_PATH, "r", encoding="utf-8") as f:
        audit = json.load(f)

    assert audit["auditStatus"] == "PASSED"
    assert audit["fakeNGOs"] == 0
    assert audit["fakeCoordinates"] == 0
    assert audit["fakeDemand"] == 0
    assert audit["fakeCapacity"] == 0


def test_recommendation_service_explainability():
    from ai_service.app.services.recommender import RecommendationService

    service = RecommendationService()

    donation = {
        "location": {"latitude": 28.6139, "longitude": 77.2090},
        "food_category": "Cooked Meals",
        "expiry_time": "2026-08-15T18:00:00Z"
    }

    ngos = [
        {
            "ngo_id": "ngo_1",
            "ngo_name": "Verified Food Relief NGO",
            "location": {"latitude": 28.6200, "longitude": 77.2100},
            "verified": True,
            "source": "mongodb",
            "preferred_categories": ["cooked meals"],
            "historicalDemand": {"category": "Cooked Meals", "requestCount": 12, "requestedQuantity": 150},
            "pending_requests": 2
        },
        {
            "ngo_id": "osm_101",
            "ngo_name": "Community Food Shelter (OSM)",
            "location": {"latitude": 28.6300, "longitude": 77.2200},
            "source": "osm"
        }
    ]

    res = service.recommend(donation, ngos, top_k=5)
    assert res["insufficientData"] is False
    assert res["status"] == "SUCCESS"
    assert len(res["recommendations"]) == 2

    first_ngo = res["recommendations"][0]
    assert "matchScore" in first_ngo
    assert first_ngo["distanceType"] == "straight_line"
    assert "factorsUsed" in first_ngo
    assert "recommendationReason" in first_ngo
    assert first_ngo["source"] in ["mongodb", "osm"]


def test_deduplication_and_invalid_coords():
    from ai_service.app.services.recommender import RecommendationService

    service = RecommendationService()
    donation = {"location": {"latitude": 28.6139, "longitude": 77.2090}}

    ngos = [
        {"ngo_id": "ngo_1", "ngo_name": "Duplicate NGO", "location": {"latitude": 28.6139, "longitude": 77.2090}, "source": "mongodb"},
        {"ngo_id": "ngo_1_dup", "ngo_name": "Duplicate NGO", "location": {"latitude": 28.6139, "longitude": 77.2090}, "source": "osm"},
        {"ngo_id": "ngo_invalid", "ngo_name": "Invalid NGO", "location": {"latitude": 999.0, "longitude": 999.0}, "source": "mongodb"}
    ]

    res = service.recommend(donation, ngos)
    assert len(res["recommendations"]) == 1
    assert res["recommendations"][0]["ngoName"] == "Duplicate NGO"


if __name__ == "__main__":
    test_recommendation_rules_json_alignment()
    test_zero_fake_data_audit_step11_report()
    test_recommendation_service_explainability()
    test_deduplication_and_invalid_coords()
    print("ALL STEP 11 RECOMMENDATION ENGINE TESTS PASSED SUCCESSFULLY!")
