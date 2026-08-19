from .health import router as health
from .recommend import router as recommend
from .risk import router as risk
from .priority import router as priority
from .demand import router as demand
from .route import router as route

__all__ = ['health', 'recommend', 'risk', 'priority', 'demand', 'route']
