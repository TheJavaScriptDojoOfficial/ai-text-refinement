from typing import List, Optional

from pydantic import BaseModel, Field


class RefineRequest(BaseModel):
    input_text: str = Field(..., description="Text to be refined.")
    tone: Optional[List[str]] = Field(
        default=None,
        description="List of desired tones, e.g. ['professional', 'polite'].",
    )
    preserve_meaning: bool = Field(
        default=True, description="Whether to preserve the original meaning."
    )
    preserve_keywords: bool = Field(
        default=True,
        description="Whether to preserve names, IDs, URLs, numbers, and technical terms.",
    )
    output_format: str = Field(
        default="paragraph", description="Either 'paragraph' or 'bullet_points'."
    )
    custom_instruction: Optional[str] = Field(
        default=None, description="Optional extra instruction for the model."
    )


class RefineResponse(BaseModel):
    output_text: str
    model: str
    success: bool = True
    error: Optional[str] = None


