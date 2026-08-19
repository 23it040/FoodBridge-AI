from fastapi import APIRouter, HTTPException
from ai_service.app.models.schemas import PriorityRequest, PriorityResponse
from ai_service.app.services.priority import compute_priority
from ai_service.app.utils.loaders import MODELS
from datetime import datetime

router = APIRouter()


@router.post('/', response_model=PriorityResponse)
async def priority(req: PriorityRequest):
    payload = {
        'expiry_time': req.expiry_time,
        'current_time': datetime.utcnow(),
        'quantity': req.quantity,
        'distance_km': req.distance_km,
        'demand': getattr(req, 'demand', None),
        'ngo_capacity': getattr(req, 'ngo_capacity', None)
    }
    model = MODELS.get('priority')
    try:
        res = compute_priority(payload, model=model)
        return res
    except RuntimeError as err:
        if "MODEL_UNAVAILABLE" in str(err):
            raise HTTPException(
                status_code=503,
                detail={"code": "MODEL_UNAVAILABLE", "message": "AI priority model is currently unavailable."}
            )
        raise HTTPException(status_code=500, detail={"code": "PREDICTION_ERROR", "message": str(err)})
