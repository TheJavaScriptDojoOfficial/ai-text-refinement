from typing import Any, Dict

import httpx


async def refine_with_ollama(prompt: str, model: str = "llama3.2") -> str:
    """
    Placeholder Ollama integration.

    If Ollama is running locally at http://localhost:11434, this will attempt a real call.
    Otherwise it falls back to echoing the prompt tail for development.
    """
    url = "http://localhost:11434/api/chat"
    payload: Dict[str, Any] = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "stream": False,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            # Ollama chat responses typically contain choices / message content
            message = data.get("message") or {}
            content = message.get("content")
            if isinstance(content, str):
                return content.strip()
    except Exception:
        # Fallback behaviour keeps the app usable without a running model.
        tail = prompt[-400:]
        return f"[Placeholder refinement]\n\n{tail}"

    return "[Refinement failed: unexpected Ollama response]"

