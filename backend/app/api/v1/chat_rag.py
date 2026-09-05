from fastapi import APIRouter
from app.schemas.schemas import ChatRequestDTO, ChatResponseDTO
from rag.assistant import twin_ai_assistant

router = APIRouter(prefix="/ai", tags=["TwinAI Grounded RAG"])

@router.post("/chat", response_model=ChatResponseDTO)
async def chat_with_twin_ai(req: ChatRequestDTO):
    return twin_ai_assistant.query(req.message)
