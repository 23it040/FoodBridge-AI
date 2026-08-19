from fastapi import APIRouter
from ai_service.app.models.schemas import RecommendRequest, RecommendResponse
from ai_service.app.services.recommender import RecommendationService
from ai_service.app.utils.loaders import MODELS

router = APIRouter()


@router.post('/', response_model=RecommendResponse)
async def recommend(req: RecommendRequest):
    model = MODELS.get('recommender')
    service = RecommendationService(model=model)
    donation = req.donation.dict()
    ngos = [n.dict() for n in req.ngos]
    recommendations = service.recommend(donation, ngos, top_k=req.top_k)
    return {'recommendations': recommendations}
