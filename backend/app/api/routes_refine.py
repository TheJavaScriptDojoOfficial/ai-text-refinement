from fastapi import APIRouter

from ..schemas.refine import RefineRequest, RefineResponse
from ..services.refinement_service import refine_text

router = APIRouter()


@router.post("/refine", response_model=RefineResponse)
async def refine(payload: RefineRequest) -> RefineResponse:
    refined = await refine_text(payload.text, payload.options.tone)
    return RefineResponse(refined_text=refined)

