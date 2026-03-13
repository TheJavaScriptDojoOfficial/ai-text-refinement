from .ollama_service import OllamaError, generate_with_ollama
from .prompt_builder import build_refinement_prompts
from ..utils.text_utils import normalize_whitespace
from ..config import ollama_settings
from ..schemas.refine import RefineRequest, RefineResponse


async def run_refinement(request: RefineRequest) -> RefineResponse:
    cleaned_text = normalize_whitespace(request.input_text)

    system_prompt, user_prompt = build_refinement_prompts(
        input_text=cleaned_text,
        tone=request.tone,
        preserve_meaning=request.preserve_meaning,
        preserve_keywords=request.preserve_keywords,
        output_format=request.output_format,
        custom_instruction=request.custom_instruction,
    )

    try:
        output = await generate_with_ollama(
            prompt=user_prompt,
            system_prompt=system_prompt,
        )
        return RefineResponse(output_text=output, model=ollama_settings.model, success=True)
    except OllamaError as exc:
        # Backend-side fallback: return a structured error without crashing the server.
        return RefineResponse(
            output_text="",
            model=ollama_settings.model,
            success=False,
            error=str(exc),
        )


