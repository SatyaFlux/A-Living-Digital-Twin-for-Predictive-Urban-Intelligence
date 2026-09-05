from fastapi import APIRouter
from typing import List
from app.schemas.schemas import AnomalyDTO
from app.services.telemetry_service import telemetry_service

router = APIRouter(prefix="/anomalies", tags=["Anomaly Detection Engine"])

@router.get("/live", response_model=List[AnomalyDTO])
async def get_live_anomalies():
    return telemetry_service.get_live_anomalies()
