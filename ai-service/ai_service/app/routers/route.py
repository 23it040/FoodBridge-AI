from fastapi import APIRouter
from ai_service.app.models.schemas import OptimizeRouteRequest, OptimizeRouteResponse
from ai_service.app.services.route_optimizer import nearest_neighbor_route
from ai_service.app.utils.loaders import MODELS
import os

router = APIRouter()


@router.post('/', response_model=OptimizeRouteResponse)
async def optimize(req: OptimizeRouteRequest):
    avg_speed = req.avg_speed_kmph or float(os.getenv('DEFAULT_SPEED_KMPH', 30))
    points = [p.dict() for p in req.donations]
    res = nearest_neighbor_route(req.start.dict(), points)
    # estimate time minutes
    time_minutes = (res['total_distance_km'] / avg_speed) * 60
    return {'sequence': res['sequence'], 'total_distance_km': res['total_distance_km'], 'estimated_time_minutes': round(time_minutes, 1)}
