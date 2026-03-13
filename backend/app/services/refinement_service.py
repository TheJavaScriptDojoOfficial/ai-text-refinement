from .refiner import refine_with_entities
from ..utils.text_utils import normalize_whitespace
from ..schemas.refine import RefineRequest, RefineResponse


async def run_refinement(request: RefineRequest) -> RefineResponse:
    cleaned_text = normalize_whitespace(request.input_text)
    if not cleaned_text or len(cleaned_text) < 5:
        # Too little content to refine usefully; return original.
        return RefineResponse(
            refined_text=request.input_text,
            entities_preserved=True,
            validation_passed=True,
        )

    refined_text, entities_preserved, validation_passed = await refine_with_entities(request)

    return RefineResponse(
        refined_text=refined_text,
        entities_preserved=entities_preserved,
        validation_passed=validation_passed,
    )


