from pydantic import BaseModel


class OllamaSettings(BaseModel):
    base_url: str = "http://localhost:11434"
    model: str = "qwen2.5:7b-instruct"
    timeout_seconds: float = 30.0


ollama_settings = OllamaSettings()

