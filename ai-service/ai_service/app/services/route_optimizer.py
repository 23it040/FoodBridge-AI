import logging
from typing import List, Dict, Any
from ai_service.app.utils.math_utils import haversine_km

logger = logging.getLogger("ai_service")


def nearest_neighbor_route(start: Dict[str, float], points: List[Dict[str, Any]], avg_speed_kmph: float = 30.0) -> Dict[str, Any]:
    if not start or start.get('latitude') is None or start.get('longitude') is None:
        logger.info("Route optimization INSUFFICIENT_DATA: invalid start coordinates")
        return {
            'sequence': [],
            'total_distance_km': None,
            'estimated_time_minutes': None,
            'insufficientData': True,
            'message': "Valid coordinates are required for route optimization.",
            'dataSource': {'mongodb': True, 'osm': False, 'synthetic': False, 'googleMaps': False}
        }

    valid_points = []
    for p in (points or []):
        loc = p.get('location') if isinstance(p, dict) else None
        if loc and loc.get('latitude') is not None and loc.get('longitude') is not None:
            valid_points.append(p)

    if len(valid_points) == 0:
        logger.info("Route optimization INSUFFICIENT_DATA: no valid pickup points with coordinates")
        return {
            'sequence': [],
            'total_distance_km': None,
            'estimated_time_minutes': None,
            'insufficientData': True,
            'message': "Valid pickup coordinates are required for route optimization.",
            'dataSource': {'mongodb': True, 'osm': False, 'synthetic': False, 'googleMaps': False}
        }

    remaining = valid_points.copy()
    current = {'location': start}
    sequence = []
    total_dist = 0.0

    while remaining:
        best_idx = None
        best_dist = float('inf')
        for i, p in enumerate(remaining):
            d = haversine_km(
                current['location']['latitude'],
                current['location']['longitude'],
                p['location']['latitude'],
                p['location']['longitude']
            )
            if d < best_dist:
                best_dist = d
                best_idx = i
        chosen = remaining.pop(best_idx)
        sequence.append(str(chosen.get('id') or chosen.get('_id')))
        total_dist += best_dist
        current = chosen

    speed = max(1.0, float(avg_speed_kmph or 30.0))
    time_minutes = round((total_dist / speed) * 60.0, 1)

    return {
        'sequence': sequence,
        'total_distance_km': round(total_dist, 2),
        'estimated_time_minutes': time_minutes,
        'insufficientData': False,
        'dataSource': {'mongodb': True, 'osm': False, 'synthetic': False, 'googleMaps': False}
    }
