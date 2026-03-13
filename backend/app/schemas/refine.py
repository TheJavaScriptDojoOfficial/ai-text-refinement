from typing import List, Optional, Literal

from pydantic import BaseModel, Field


LengthLiteral = Literal["shorter", "same", "longer"]
OutputFormatLiteral = Literal["paragraph", "bullet_points"]


class RefineRequest(BaseModel):
    input_text: str = Field(..., description="Text to be refined.")
    tone: List[str] = Field(
        default_factory=list,
        description="List of desired tones, e.g. ['professional', 'polite'].",
    )
    length: LengthLiteral = Field(
        default="same", description="Relative length: 'shorter', 'same', or 'longer'."
    )
    output_format: OutputFormatLiteral = Field(
        default="paragraph", description="Either 'paragraph' or 'bullet_points'."
    )
    preserve_meaning: bool = Field(
        default=True, description="Whether to preserve the original meaning."
    )
    preserve_keywords: bool = Field(
        default=True,
        description="Whether to preserve important keywords and project-specific terms.",
    )
    preserve_names_and_ids: bool = Field(
        default=True,
        description="Whether to preserve names, IDs, URLs, and numbers.",
    )
    keep_technical_terms: bool = Field(
        default=True,
        description="Whether to keep technical terms unchanged.",
    )
    custom_instruction: Optional[str] = Field(
        default=None, description="Optional extra instruction for the model."
    )
    preset: Optional[str] = Field(
        default=None, description="Optional preset key for logging or analytics."
    )


class RefineResponse(BaseModel):
    output_text: str
    model: str
    success: bool = True
    error: Optional[str] = None


