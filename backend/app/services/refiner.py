from typing import Tuple

from .ollama_service import generate_with_ollama, OllamaError
from .prompt_builder import build_refinement_prompts
from ..schemas.refine import RefineRequest
from ..utils.text_utils import normalize_whitespace
from ..utils.entity_extractor import mask_entities, restore_entities
from ..utils.output_validator import validate_output


async def refine_with_entities(request: RefineRequest) -> Tuple[str, bool, bool]:
    """
    Full refinement pipeline with entity masking and output validation.

    Returns (refined_text, entities_preserved, validation_passed).
    """
    cleaned = normalize_whitespace(request.input_text)

    # Mask entities before sending to the model
    mask_result = mask_entities(cleaned)
    masked_input = mask_result.masked_text
    entities = mask_result.entities

    tones = request.tone or ["professional"]

    system_prompt, user_prompt = build_refinement_prompts(
        input_text=masked_input,
        tone=tones,
        length=request.length,
        preserve_meaning=request.preserve_meaning,
        preserve_keywords=request.preserve_keywords,
        preserve_names_and_ids=request.preserve_names_and_ids,
        keep_technical_terms=request.keep_technical_terms,
        output_format=request.output_format,
        custom_instruction=request.custom_instruction,
        preset=request.preset,
    )

    last_masked_output = masked_input
    validation_passed = False

    # Try once, with a single retry if validation fails
    for _ in range(2):
        masked_output = await generate_with_ollama(
            prompt=user_prompt,
            system_prompt=system_prompt,
        )
        last_masked_output = masked_output

        if validate_output(original_masked=masked_input, refined_masked=masked_output, entities=entities):
            validation_passed = True
            break

    # If validation never passed, return the original text with flags
    if not validation_passed:
        return cleaned, False, False

    # Restore entities into the validated refined text
    refined_text = restore_entities(last_masked_output, entities)
    return refined_text, True, True

