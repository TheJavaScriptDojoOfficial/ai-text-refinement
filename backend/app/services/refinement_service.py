from .refiner import refine_with_entities
from ..utils.text_utils import normalize_whitespace
from ..schemas.refine import RefineRequest, RefineResponse


async def run_refinement(request: RefineRequest) -> RefineResponse:
    raw = request.get_input_text()
    cleaned_text = normalize_whitespace(raw)
    if not cleaned_text or len(cleaned_text) < 5:
        return RefineResponse(
            refined_text=raw,
            mode=request.mode,
            entities_preserved=True,
            validation_passed=True,
        )

    refined_text, entities_preserved, validation_passed = await refine_with_entities(request)

    return RefineResponse(
        refined_text=refined_text,
        mode=request.mode,
        entities_preserved=entities_preserved,
        validation_passed=validation_passed,
    )


