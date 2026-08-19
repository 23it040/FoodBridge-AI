import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from ai_service.app.utils.math_utils import haversine_km

logger = logging.getLogger("ai_service")

MAX_DISTANCE_KM = 50.0

FACTOR_WEIGHTS = {
    'distance': 0.35,
    'categoryMatch': 0.25,
    'expiryUrgency': 0.15,
    'historicalDemand': 0.15,
    'currentWorkload': 0.05,
    'verificationStatus': 0.05
}


class RecommendationService:
    def __init__(self, model: Optional[Any] = None):
        self.model = model

    def recommend(self, donation: Dict[str, Any], ngos: List[Dict[str, Any]], top_k: int = 5) -> Dict[str, Any]:
        if not donation or not donation.get('location'):
            logger.info("Recommendation INSUFFICIENT_DATA: missing donation location")
            return {
                'recommendations': [],
                'insufficientData': True,
                'status': 'NO_MATCHING_ORGANIZATION',
                'message': "Donation location is required for NGO recommendation.",
                'dataSource': {'mongodb': False, 'osm': False, 'synthetic': False}
            }

        if not ngos or len(ngos) == 0:
            logger.info("Recommendation: No nearby NGOs provided")
            return {
                'recommendations': [],
                'insufficientData': False,
                'status': 'NO_MATCHING_ORGANIZATION',
                'message': "No verified or external nearby food organizations with valid location data were found.",
                'dataSource': {'mongodb': False, 'osm': False, 'synthetic': False}
            }

        scored_result = self._score_deterministic(donation, ngos, top_k)
        
        has_osm = any(item.get('source') == 'osm' for item in scored_result)
        has_mongo = any(item.get('source') == 'mongodb' for item in scored_result)

        return {
            'recommendations': scored_result,
            'insufficientData': False,
            'status': 'SUCCESS' if len(scored_result) > 0 else 'NO_MATCHING_ORGANIZATION',
            'message': None if len(scored_result) > 0 else "No verified or external nearby food organizations found.",
            'dataSource': {'mongodb': has_mongo, 'osm': has_osm, 'synthetic': False}
        }

    def _score_deterministic(self, donation: Dict[str, Any], ngos: List[Dict[str, Any]], top_k: int) -> List[Dict[str, Any]]:
        donation_location = donation['location']
        donation_category = (donation.get('food_category') or donation.get('category') or '').strip().lower()
        expiry_urgency = self._compute_expiry_urgency(donation)

        scored = []
        seen_keys = set()

        for ngo in ngos:
            ngo_loc = ngo.get('location') or ngo.get('coordinates')
            if not ngo_loc:
                continue

            lat = ngo_loc.get('latitude') if isinstance(ngo_loc, dict) else ngo_loc[1] if isinstance(ngo_loc, (list, tuple)) else None
            lng = ngo_loc.get('longitude') if isinstance(ngo_loc, dict) else ngo_loc[0] if isinstance(ngo_loc, (list, tuple)) else None

            if lat is None or lng is None or not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
                continue

            ngo_name = str(ngo.get('ngo_name') or ngo.get('ngoName') or ngo.get('name') or 'Organization').strip()
            dedup_key = f"{ngo_name.lower()}_{round(lat, 3)}_{round(lng, 3)}"
            if dedup_key in seen_keys:
                continue
            seen_keys.add(dedup_key)

            dist = haversine_km(
                donation_location['latitude'],
                donation_location['longitude'],
                lat,
                lng
            )

            source = ngo.get('source', 'mongodb').lower()
            is_mongo = source == 'mongodb'
            verification_status = 'VERIFIED' if is_mongo and (ngo.get('verified') or ngo.get('isVerified')) else ('APPROVED' if is_mongo else 'EXTERNAL')

            factors_used = []
            factors_unavailable = []
            weighted_scores = []
            available_weight_sum = 0.0

            # 1. Distance Factor (Always available with valid coords)
            dist_factor_score = max(0.0, 1.0 - (dist / MAX_DISTANCE_KM))
            weighted_scores.append(dist_factor_score * FACTOR_WEIGHTS['distance'])
            available_weight_sum += FACTOR_WEIGHTS['distance']
            factors_used.append('distance')

            # 2. Category Match Factor
            preferred_categories = [str(c).strip().lower() for c in ngo.get('preferred_categories', []) if c]
            if donation_category:
                cat_match = donation_category in preferred_categories if preferred_categories else True
                cat_score = 1.0 if cat_match else 0.5
                weighted_scores.append(cat_score * FACTOR_WEIGHTS['categoryMatch'])
                available_weight_sum += FACTOR_WEIGHTS['categoryMatch']
                factors_used.append('categoryMatch')
            else:
                cat_match = False
                factors_unavailable.append('categoryMatch')

            # 3. Expiry Urgency Factor
            urgency_score = 1.0 if expiry_urgency == 'CRITICAL' else (0.8 if expiry_urgency == 'URGENT' else 0.5)
            weighted_scores.append(urgency_score * FACTOR_WEIGHTS['expiryUrgency'])
            available_weight_sum += FACTOR_WEIGHTS['expiryUrgency']
            factors_used.append('expiryUrgency')

            # 4. Verification Factor
            ver_score = 1.0 if is_mongo else 0.5
            weighted_scores.append(ver_score * FACTOR_WEIGHTS['verificationStatus'])
            available_weight_sum += FACTOR_WEIGHTS['verificationStatus']
            factors_used.append('verificationStatus')

            # 5. Historical Demand Factor (MongoDB only)
            hist_demand = ngo.get('historicalDemand') or ngo.get('historical_demand')
            if is_mongo and hist_demand:
                hist_score = min(1.0, (hist_demand.get('requestCount', 0) or 0) / 50.0)
                weighted_scores.append(hist_score * FACTOR_WEIGHTS['historicalDemand'])
                available_weight_sum += FACTOR_WEIGHTS['historicalDemand']
                factors_used.append('historicalDemand')
            else:
                factors_unavailable.append('historicalDemand')

            # 6. Current Workload Factor (MongoDB only)
            pending_reqs = ngo.get('pending_requests') or ngo.get('pendingRequests')
            if is_mongo and pending_reqs is not None:
                workload_score = 1.0 / (1.0 + max(0, pending_reqs))
                weighted_scores.append(workload_score * FACTOR_WEIGHTS['currentWorkload'])
                available_weight_sum += FACTOR_WEIGHTS['currentWorkload']
                factors_used.append('currentWorkload')
            else:
                factors_unavailable.append('currentWorkload')

            # Dynamic score normalization strictly over available weights
            raw_sum = sum(weighted_scores)
            norm_score = (raw_sum / available_weight_sum) * 100.0 if available_weight_sum > 0 else 50.0
            match_score = round(float(max(0.0, min(norm_score, 100.0))), 1)

            reason = self._generate_explainable_reason(
                is_mongo, verification_status, dist, cat_match, expiry_urgency, hist_demand
            )

            scored.append({
                'ngoId': str(ngo.get('ngo_id') or ngo.get('ngoId') or ngo.get('id') or 'ngo'),
                'ngoName': ngo_name,
                'source': 'mongodb' if is_mongo else 'osm',
                'verificationStatus': verification_status,
                'matchScore': match_score,
                'score': match_score,
                'distanceKm': round(dist, 2),
                'distance': round(dist, 2),
                'distanceType': 'straight_line',
                'categoryMatch': cat_match,
                'expiryUrgency': expiry_urgency,
                'historicalDemandAvailable': is_mongo and bool(hist_demand),
                'historicalDemand': hist_demand if is_mongo else None,
                'workloadAvailable': is_mongo and pending_reqs is not None,
                'factorsUsed': factors_used,
                'factorsUnavailable': factors_unavailable,
                'recommendationReason': reason,
                'location': {
                    'latitude': float(lat),
                    'longitude': float(lng)
                }
            })

        return sorted(scored, key=lambda item: item['matchScore'], reverse=True)[:top_k]

    def _compute_expiry_urgency(self, donation: Dict[str, Any]) -> str:
        try:
            expiry_val = donation.get('expiry_time') or donation.get('expiryTime')
            if not expiry_val:
                return 'NORMAL'
            expiry = self._parse_datetime(expiry_val)
            now = datetime.utcnow()
            diff_hours = (expiry - now).total_seconds() / 3600.0
            if diff_hours < 6.0:
                return 'CRITICAL'
            elif diff_hours < 24.0:
                return 'URGENT'
            return 'NORMAL'
        except Exception:
            return 'NORMAL'

    def _parse_datetime(self, value):
        if not value:
            return None
        if isinstance(value, datetime):
            return value
        return datetime.fromisoformat(str(value).replace('Z', ''))

    def _generate_explainable_reason(
        self, is_mongo: bool, verification_status: str, dist: float, cat_match: bool, expiry_urgency: str, hist_demand: Any
    ) -> str:
        if is_mongo and cat_match and hist_demand:
            return f"Verified FoodBridge NGO located {round(dist, 1)} km away with recent requests matching this food category."
        elif is_mongo:
            return f"Verified FoodBridge NGO located {round(dist, 1)} km away; historical category demand is currently unavailable."
        else:
            return f"External nearby organization discovered through OpenStreetMap ({round(dist, 1)} km away); FoodBridge operational history is unavailable."
