from .ollama_service import refine_with_ollama
from .prompt_builder import build_refinement_prompt
from ..utils.text_utils import normalize_whitespace


async def refine_text(text: str, tone: str) -> str:
    cleaned = normalize_whitespace(text)
    prompt = build_refinement_prompt(cleaned, tone)
    return await refine_with_ollama(prompt)

