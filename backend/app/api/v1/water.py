from fastapi import APIRouter
from typing import List
from app.schemas.schemas import WaterDTO
from app.services.telemetry_service import telemetry_service

router = APIRouter(prefix="/water", tags=["Water Intelligence"])

@router.get("/live", response_model=List[WaterDTO])
async def get_live_water():
    return telemetry_service.get_live_water()
