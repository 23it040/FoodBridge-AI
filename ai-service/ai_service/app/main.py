from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ai_service.app.routers.health import router as health_router
from ai_service.app.routers.recommend import router as recommend_router
from ai_service.app.routers.risk import router as risk_router
from ai_service.app.routers.priority import router as priority_router
from ai_service.app.routers.demand import router as demand_router
from ai_service.app.routers.route import router as route_router
from ai_service.app.utils.exceptions import register_exception_handlers
from ai_service.app.utils.loaders import load_models_on_startup

app = FastAPI(title='FoodBridge AI Service')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)


@app.get('/')
async def root():
    return {
        "service": "FoodBridge AI Service",
        "status": "Running"
    }


@app.on_event('startup')
async def startup_event():
    # Load ML models and other heavy resources
    await load_models_on_startup()


register_exception_handlers(app)

app.include_router(health_router, prefix='/health')
app.include_router(recommend_router, prefix='/recommend')
app.include_router(risk_router, prefix='/risk-score')
app.include_router(priority_router, prefix='/priority-score')
app.include_router(demand_router, prefix='/predict-demand')
app.include_router(route_router, prefix='/optimize-route')

__all__ = ('app',)
