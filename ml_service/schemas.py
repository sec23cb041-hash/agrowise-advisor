from typing import List, Optional
from pydantic import BaseModel


class SoilProperties(BaseModel):
    drainage: str
    fertility: str
    water_retention: str
    texture: str
    ph_range: str


class SoilRecommendations(BaseModel):
    crops: List[str]
    fertilizer: str
    irrigation: str
    improvement_tips: List[str]


class SoilParameters(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float


class EnvironmentConditions(BaseModel):
    temperature: float
    humidity: float
    moisture: float
    rainfall: float


class SoilPredictionResponse(BaseModel):
    soil_type: str
    confidence: float
    certainty: str
    properties: SoilProperties
    recommendations: SoilRecommendations
    soil_parameters: Optional[SoilParameters] = None
    environment: Optional[EnvironmentConditions] = None


class DiseaseTreatment(BaseModel):
    organic: List[str]
    chemical: List[str]


class DiseasePredictionResponse(BaseModel):
    disease: str
    confidence: float
    certainty: str
    description: str
    symptoms: List[str]
    causes: List[str]
    treatment: DiseaseTreatment
    prevention: List[str]


class WeatherAdvice(BaseModel):
    temperature: float
    humidity: int
    wind_speed: float
    description: str
    city: str
    advice: List[str]


# Keep simple response for backward compat
class PredictionResponse(BaseModel):
    predicted_class: str
    confidence: float
