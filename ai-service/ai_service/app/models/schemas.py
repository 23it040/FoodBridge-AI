from pydantic import BaseModel, Field, conlist
from typing import List, Optional, Dict, Any
from datetime import datetime


class DataSource(BaseModel):
    mongodb: bool = True
    osm: bool = False
    synthetic: bool = False
    googleMaps: bool = False


class Location(BaseModel):
    latitude: float
    longitude: float

    class Config:
        allow_population_by_field_name = True
        populate_by_name = True


class DonationIn(BaseModel):
    location: Location
    quantity: int
    food_category: str
    expiry_time: Optional[datetime] = None
    meal_type: Optional[str] = None
    donation_time: Optional[datetime] = None

    class Config:
        allow_population_by_field_name = True
        populate_by_name = True


class NGOItem(BaseModel):
    ngo_id: str = Field(..., alias='ngoId')
    ngo_name: str = Field(..., alias='ngoName')
    location: Location
    capacity: Optional[int] = None
    previous_collections: Optional[int] = 0
    preferred_categories: Optional[List[str]] = []
    active: Optional[bool] = True
    pending_requests: Optional[int] = 0
    source: Optional[str] = 'mongodb'

    class Config:
        allow_population_by_field_name = True
        populate_by_name = True


class RecommendRequest(BaseModel):
    donation: DonationIn
    ngos: List[NGOItem]
    top_k: Optional[int] = 5

    class Config:
        allow_population_by_field_name = True
        populate_by_name = True


class RecommendationItem(BaseModel):
    ngoId: str
    ngoName: str
    score: float
    distance: float
    recommendationReason: str
    confidence: Optional[float] = None
    source: Optional[str] = 'mongodb'
    location: Optional[Location] = None

    class Config:
        allow_population_by_field_name = True
        populate_by_name = True


class RecommendResponse(BaseModel):
    recommendations: List[RecommendationItem] = []
    warning: Optional[str] = None
    insufficientData: Optional[bool] = False
    message: Optional[str] = None
    dataSource: Optional[Dict[str, bool]] = Field(default_factory=lambda: {"mongodb": True, "osm": False, "synthetic": False, "googleMaps": False})

    class Config:
        allow_population_by_field_name = True
        populate_by_name = True


class RiskRequest(BaseModel):
    food_category: Optional[str] = Field(None, alias='foodCategory')
    category: Optional[str] = None
    ph: Optional[float] = Field(None, alias='pH')
    temperature: Optional[float] = Field(None, alias='temperature_c')
    taste: Optional[int] = None
    odor: Optional[int] = None
    fat: Optional[int] = None
    turbidity: Optional[int] = None
    color: Optional[int] = Field(None, alias='colour')

    class Config:
        allow_population_by_field_name = True
        populate_by_name = True


class RiskResponse(BaseModel):
    prediction: Optional[str] = None
    riskLevel: Optional[str] = Field(None, alias='risk_level')
    modelReady: Optional[bool] = False
    modelStatus: Optional[str] = "EXTERNAL_DATA_MODEL"
    modelVersion: Optional[str] = "1.0.0"
    metrics: Optional[Dict[str, Any]] = None
    uncertainty: Optional[str] = "Prediction uncertainty is not calibrated."
    dataSource: Optional[str] = "Public Milk Quality Dataset"
    foodBridgeTrained: Optional[bool] = False
    insufficientData: Optional[bool] = False
    missingFeatures: Optional[List[str]] = None
    message: Optional[str] = None

    class Config:
        allow_population_by_field_name = True
        populate_by_name = True


class PriorityRequest(BaseModel):
    food_category: Optional[str] = Field(None, alias='foodCategory')
    category: Optional[str] = None
    expiry_time: Optional[datetime] = Field(None, alias='expiryTime')
    quantity: Optional[int] = None
    distance_km: Optional[float] = Field(None, alias='distanceKm')
    created_at: Optional[datetime] = Field(None, alias='createdAt')

    class Config:
        allow_population_by_field_name = True
        populate_by_name = True


class PriorityResponse(BaseModel):
    prediction: Optional[float] = None
    priorityScore: Optional[float] = Field(None, alias='score')
    priorityLevel: Optional[str] = None
    insufficientData: Optional[bool] = False
    modelReady: Optional[bool] = False
    missingFeatures: Optional[List[str]] = None
    message: Optional[str] = None
    modelStatus: Optional[str] = "INSUFFICIENT_DATA"
    modelVersion: Optional[str] = "1.0.0"
    dataSource: Optional[str] = "MongoDB FoodBridge Database"
    foodBridgeTrained: Optional[bool] = False

    class Config:
        allow_population_by_field_name = True
        populate_by_name = True


class DemandRequest(BaseModel):
    food_category: Optional[str] = Field(None, alias='foodCategory')
    category: Optional[str] = None
    center_type: Optional[str] = Field(None, alias='centerType')
    op_area: Optional[float] = Field(None, alias='opArea')
    previous_donations: Optional[float] = Field(None, alias='previousDonations')
    historical_demand: Optional[float] = Field(None, alias='historicalDemand')
    week: Optional[int] = None
    day_of_week: Optional[int] = Field(None, alias='dayOfWeek')
    city: Optional[str] = None
    season: Optional[str] = None

    class Config:
        allow_population_by_field_name = True
        populate_by_name = True


class DemandResponse(BaseModel):
    prediction: Optional[float] = None
    expected_meals: Optional[float] = None
    modelReady: Optional[bool] = False
    modelStatus: Optional[str] = "EXTERNAL_DATA_MODEL"
    modelVersion: Optional[str] = "1.0.0"
    metrics: Optional[Dict[str, Any]] = None
    uncertainty: Optional[str] = "Prediction uncertainty is not calibrated."
    dataSource: Optional[str] = "Kaggle Food Demand Forecasting"
    foodBridgeTrained: Optional[bool] = False
    insufficientData: Optional[bool] = False
    missingFeatures: Optional[List[str]] = None
    message: Optional[str] = None

    class Config:
        allow_population_by_field_name = True
        populate_by_name = True



class RoutePoint(BaseModel):
    id: str
    location: Location


class OptimizeRouteRequest(BaseModel):
    start: Optional[Location] = None
    donations: Optional[List[RoutePoint]] = None
    avg_speed_kmph: Optional[float] = None


class OptimizeRouteResponse(BaseModel):
    sequence: Optional[List[str]] = []
    total_distance_km: Optional[float] = None
    estimated_time_minutes: Optional[float] = None
    insufficientData: Optional[bool] = False
    missingFeatures: Optional[List[str]] = None
    message: Optional[str] = None
    dataSource: Optional[Dict[str, bool]] = Field(default_factory=lambda: {"mongodb": True, "osm": False, "synthetic": False, "googleMaps": False})
