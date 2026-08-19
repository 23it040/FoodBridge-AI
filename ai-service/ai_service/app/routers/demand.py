from fastapi import APIRouter, HTTPException, status
from ai_service.app.models.schemas import DemandRequest, DemandResponse
from ai_service.app.utils.loaders import MODELS
from ai_service.app.services.demand import predict_demand

router = APIRouter()


@router.post('/', response_model=DemandResponse)
async def predict(req: DemandRequest):
    model = MODELS.get('demand')
    try:
        res = predict_demand(req.dict(), model=model)
        return res
    except RuntimeError as err:
        if "MODEL_UNAVAILABLE" in str(err):
            raise HTTPException(
                status_code=status.HTTP_533_LOGICAL_TIMEOUT if hasattr(status, 'HTTP_533_LOGICAL_TIMEOUT') else 503,
                detail={"code": "MODEL_UNAVAILABLE", "message": "AI model is currently unavailable."}
            )
        raise HTTPException(status_code=500, detail={"code": "PREDICTION_ERROR", "message": str(err)})
