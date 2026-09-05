from fastapi import APIRouter
from typing import List
from app.schemas.schemas import ModelMetricDTO
from app.services.ml_service import ml_service

router = APIRouter(prefix="/models", tags=["Model Governance & Monitoring"])

@router.get("/metrics", response_model=List[ModelMetricDTO])
async def get_model_metrics():
    return ml_service.get_model_metrics()
