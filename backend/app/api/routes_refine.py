from fastapi import APIRouter

from ..schemas.refine import RefineRequest, RefineResponse
from ..services.refinement_service import run_refinement

router = APIRouter()


@router.post("/refine", response_model=RefineResponse)
async def refine(payload: RefineRequest) -> RefineResponse:
    """
    Refine text using the local LLM with entity preservation and validation.
    """
    return await run_refinement(payload)


