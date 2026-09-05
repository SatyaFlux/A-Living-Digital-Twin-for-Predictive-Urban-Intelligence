from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.schemas import AirQualityDTO, PredictionResponseDTO
from app.services.telemetry_service import telemetry_service
from app.services.ml_service import ml_service

router = APIRouter(prefix="/air-quality", tags=["Air Quality Intelligence"])

@router.get("/live", response_model=List[AirQualityDTO])
async def get_live_air_quality():
    return telemetry_service.get_live_air_quality()

@router.get("/prediction/{location_id}", response_model=PredictionResponseDTO)
async def get_aqi_prediction(location_id: int):
    aqi_list = telemetry_service.get_live_air_quality()
    station = next((a for a in aqi_list if a.location_id == location_id), None)
    if not station:
        raise HTTPException(status_code=404, detail="Air quality monitoring station not found")
    
    return ml_service.get_aqi_prediction(location_id, station.aqi)
