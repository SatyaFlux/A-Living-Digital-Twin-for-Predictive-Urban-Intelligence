from fastapi import APIRouter
from app.schemas.schemas import CameraFeedDTO
from cv.vision_pipeline import vision_pipeline

router = APIRouter(prefix="/vision", tags=["Computer Vision Analytics"])

@router.get("/stream/{camera_id}", response_model=CameraFeedDTO)
async def get_camera_stream_analytics(camera_id: str = "CAM_01_GATE2"):
    return vision_pipeline.process_camera_stream(camera_id)
