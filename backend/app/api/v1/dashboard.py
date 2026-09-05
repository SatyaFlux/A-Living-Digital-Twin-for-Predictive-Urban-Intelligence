from fastapi import APIRouter
from typing import List
from app.schemas.schemas import DashboardOverviewDTO, LocationDTO
from app.services.telemetry_service import telemetry_service, LOCATIONS_DATA

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/overview", response_model=DashboardOverviewDTO)
async def get_overview():
    return telemetry_service.get_dashboard_overview()

@router.get("/locations", response_model=List[LocationDTO])
async def get_locations():
    return [LocationDTO(**loc) for loc in LOCATIONS_DATA]
