from typing import Any, Dict, Optional

import httpx

from ..config import ollama_settings


class OllamaError(Exception):
    """Raised when a call to Ollama fails."""


async def generate_with_ollama(
    *,
    prompt: str,
    system_prompt: str,
    model: Optional[str] = None,
) -> str:
    """
    Call the local Ollama generate API and return only the model output text.
    """
    url = f"{ollama_settings.base_url.rstrip('/')}/api/generate"
    model_name = model or ollama_settings.model

    payload: Dict[str, Any] = {
        "model": model_name,
        "prompt": prompt,
        "system": system_prompt,
        "stream": False,
    }

    try:
        async with httpx.AsyncClient(timeout=ollama_settings.timeout_seconds) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
    except httpx.RequestError as exc:
        raise OllamaError(f"Could not reach Ollama at {url}: {exc}") from exc
    except httpx.HTTPStatusError as exc:
        raise OllamaError(
            f"Ollama returned HTTP {exc.response.status_code}: {exc.response.text}"
        ) from exc

    output = data.get("response")
    if not isinstance(output, str) or not output.strip():
        raise OllamaError("Ollama returned an empty or invalid response")

    return output.strip()


