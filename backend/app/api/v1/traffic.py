from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.schemas import RoadDTO, PredictionResponseDTO
from app.services.telemetry_service import telemetry_service
from app.services.ml_service import ml_service

router = APIRouter(prefix="/traffic", tags=["Traffic Intelligence"])

@router.get("/live", response_model=List[RoadDTO])
async def get_live_traffic():
    return telemetry_service.get_live_roads()

@router.get("/prediction/{road_id}", response_model=PredictionResponseDTO)
async def get_traffic_prediction(road_id: int):
    roads = telemetry_service.get_live_roads()
    road = next((r for r in roads if r.id == road_id), None)
    if not road:
        raise HTTPException(status_code=404, detail="Road segment not found")
    
    return ml_service.get_traffic_prediction(road_id, road.current_congestion_pct or 50.0)
