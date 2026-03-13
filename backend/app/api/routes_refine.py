from fastapi import APIRouter, HTTPException, status

from ..schemas.refine import RefineRequest, RefineResponse
from ..services.refinement_service import run_refinement

router = APIRouter()


@router.post("/refine", response_model=RefineResponse)
async def refine(payload: RefineRequest) -> RefineResponse:
    result = await run_refinement(payload)

    if not result.success:
        # Expose a safe error to the client while keeping a consistent response model.
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=result.error or "Failed to refine text with local model.",
        )

    return result


