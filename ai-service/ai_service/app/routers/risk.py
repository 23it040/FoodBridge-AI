from fastapi import APIRouter, HTTPException
from ai_service.app.models.schemas import RiskRequest, RiskResponse
from ai_service.app.services.risk import risk_score
from ai_service.app.utils.loaders import MODELS

router = APIRouter()


@router.post('/', response_model=RiskResponse)
async def risk(req: RiskRequest):
    payload = {
        'food_category': req.food_category,
        'cooked_time': req.cooked_time,
        'current_time': req.current_time,
        'temperature_c': req.temperature_c,
        'expiry_time': req.expiry_time
    }
    model = MODELS.get('risk')
    try:
        res = risk_score(payload, model=model)
        return res
    except RuntimeError as err:
        if "MODEL_UNAVAILABLE" in str(err):
            raise HTTPException(
                status_code=503,
                detail={"code": "MODEL_UNAVAILABLE", "message": "AI risk model is currently unavailable."}
            )
        raise HTTPException(status_code=500, detail={"code": "PREDICTION_ERROR", "message": str(err)})
