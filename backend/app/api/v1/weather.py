from fastapi import APIRouter
from app.schemas.schemas import WeatherDTO
from app.services.telemetry_service import telemetry_service

router = APIRouter(prefix="/weather", tags=["Weather Integration"])

@router.get("/current", response_model=WeatherDTO)
async def get_current_weather():
    return telemetry_service.get_live_weather()
