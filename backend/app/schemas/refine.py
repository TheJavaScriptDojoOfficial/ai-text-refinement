from typing import List, Optional, Literal

from pydantic import BaseModel, Field, model_validator

from ..refinement_modes import VALID_MODES


LengthLiteral = Literal["shorter", "same", "longer"]
OutputFormatLiteral = Literal["paragraph", "bullet_points"]
ExactnessLiteral = Literal["strict", "balanced", "loose"]


class RefineRequest(BaseModel):
    """Accepts either 'text' (mode-based flow) or 'input_text' (legacy flow)."""

    text: Optional[str] = Field(default=None, description="Text to refine (mode-based flow).")
    input_text: Optional[str] = Field(default=None, description="Text to refine (legacy).")
    mode: Optional[str] = Field(
        default="clarity",
        description="Refinement mode key. Default: clarity.",
    )
    exactness: ExactnessLiteral = Field(
        default="balanced",
        description="How strictly to preserve structure/meaning: strict, balanced, or loose.",
    )
    custom_instruction: Optional[str] = Field(
        default=None,
        description="Required when mode is 'custom'; optional otherwise.",
    )
    tone: List[str] = Field(
        default_factory=list,
        description="List of desired tones (legacy).",
    )
    length: LengthLiteral = Field(
        default="same",
        description="Relative length (legacy).",
    )
    output_format: OutputFormatLiteral = Field(
        default="paragraph",
        description="Paragraph or bullet_points (legacy).",
    )
    preserve_meaning: bool = Field(default=True, description="Preserve meaning.")
    preserve_keywords: bool = Field(default=True, description="Preserve keywords.")
    preserve_names_and_ids: bool = Field(default=True, description="Preserve names/IDs.")
    keep_technical_terms: bool = Field(default=True, description="Keep technical terms.")
    preset: Optional[str] = Field(default=None, description="Preset key (legacy).")

    @model_validator(mode="after")
    def validate_request(self):
        body_text = self.text or self.input_text
        if body_text is None or (isinstance(body_text, str) and not body_text.strip()):
            raise ValueError("Either 'text' or 'input_text' must be non-empty.")
        if self.mode is not None and self.mode not in VALID_MODES:
            raise ValueError(f"Invalid mode: {self.mode}. Must be one of {sorted(VALID_MODES)}.")
        if self.mode == "custom" and not (self.custom_instruction or "").strip():
            raise ValueError("custom_instruction is required when mode is 'custom'.")
        return self

    def get_input_text(self) -> str:
        """Single source for the text to refine."""
        return (self.text or self.input_text or "").strip()


class RefineResponse(BaseModel):
    refined_text: str
    mode: Optional[str] = None
    entities_preserved: bool
    validation_passed: bool


