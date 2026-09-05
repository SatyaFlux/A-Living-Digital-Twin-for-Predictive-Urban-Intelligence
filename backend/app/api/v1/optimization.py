from fastapi import APIRouter
from app.schemas.schemas import OptimizationRequestDTO, OptimizationResultDTO
from simulation.optimization_engine import optimization_engine

router = APIRouter(prefix="/optimization", tags=["Optimization Engine"])

@router.post("/solve", response_model=OptimizationResultDTO)
async def solve_urban_optimization(req: OptimizationRequestDTO):
    return optimization_engine.solve(req.objective_weights)
