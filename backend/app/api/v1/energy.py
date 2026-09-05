from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.schemas import BuildingDTO, PredictionResponseDTO
from app.services.telemetry_service import telemetry_service
from app.services.ml_service import ml_service

router = APIRouter(prefix="/energy", tags=["Energy Intelligence"])

@router.get("/live", response_model=List[BuildingDTO])
async def get_live_energy():
    return telemetry_service.get_live_buildings()

@router.get("/prediction/{building_id}", response_model=PredictionResponseDTO)
async def get_energy_prediction(building_id: int):
    buildings = telemetry_service.get_live_buildings()
    building = next((b for b in buildings if b.id == building_id), None)
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
    
    return ml_service.get_energy_prediction(building_id, building.current_energy_kwh or 50.0)
