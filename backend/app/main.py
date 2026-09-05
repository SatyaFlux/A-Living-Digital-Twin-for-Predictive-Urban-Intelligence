import asyncio
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import (
    auth, dashboard, digital_twin, traffic, air_quality,
    energy, water, weather, anomalies, scenarios,
    optimization, vision, chat_rag, reports, models_meta
)
from app.services.telemetry_service import telemetry_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables asynchronously on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print(f"[{settings.PROJECT_NAME}] Database tables verified and initialized successfully.")
    yield
    await engine.dispose()
    print(f"[{settings.PROJECT_NAME}] Database connections cleanly disposed.")

app = FastAPI(
    title=settings.PROJECT_TITLE,
    description="An AI-Powered Digital Twin Framework for Predictive Urban Intelligence and What-If Decision Simulation",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(digital_twin.router, prefix=settings.API_V1_STR)
app.include_router(traffic.router, prefix=settings.API_V1_STR)
app.include_router(air_quality.router, prefix=settings.API_V1_STR)
app.include_router(energy.router, prefix=settings.API_V1_STR)
app.include_router(water.router, prefix=settings.API_V1_STR)
app.include_router(weather.router, prefix=settings.API_V1_STR)
app.include_router(anomalies.router, prefix=settings.API_V1_STR)
app.include_router(scenarios.router, prefix=settings.API_V1_STR)
app.include_router(optimization.router, prefix=settings.API_V1_STR)
app.include_router(vision.router, prefix=settings.API_V1_STR)
app.include_router(chat_rag.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(models_meta.router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "is_demo_mode": settings.IS_DEMO_MODE
    }

# Real-Time WebSocket for Live Digital Twin Stream
@app.websocket("/ws/telemetry")
async def websocket_telemetry_stream(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            overview = telemetry_service.get_dashboard_overview()
            roads = telemetry_service.get_live_roads()
            buildings = telemetry_service.get_live_buildings()
            aqi_nodes = telemetry_service.get_live_air_quality()
            
            payload = {
                "type": "TELEMETRY_UPDATE",
                "timestamp": overview.timestamp.isoformat(),
                "overview": overview.model_dump(),
                "roads": [r.model_dump() for r in roads],
                "buildings": [b.model_dump() for b in buildings],
                "air_quality": [a.model_dump() for a in aqi_nodes]
            }
            await websocket.send_text(json.dumps(payload, default=str))
            await asyncio.sleep(settings.TELEMETRY_INTERVAL_SECONDS)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket client error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
