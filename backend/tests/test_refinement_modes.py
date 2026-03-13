"""Tests for refinement mode config and prompt generation."""

import pytest
from pydantic import ValidationError

from app.refinement_modes import REFINEMENT_MODES, VALID_MODES
from app.services.prompt_builder import build_refinement_prompts_from_mode
from app.schemas.refine import RefineRequest, RefineResponse


def test_grammar_only_instruction_does_not_request_style():
    system, _ = build_refinement_prompts_from_mode(
        input_text="Fix this sentance.",
        mode="grammar_only",
        custom_instruction=None,
        exactness="balanced",
    )
    assert "grammar" in system.lower() or "spelling" in system.lower()
    assert "only" in system.lower() or "preserve" in system.lower()
    assert "placeholder" in system.lower() or "__URL_" in system


def test_concise_instructs_shortening():
    system, _ = build_refinement_prompts_from_mode(
        input_text="Some long text here.",
        mode="concise",
        custom_instruction=None,
        exactness="balanced",
    )
    assert "shorten" in system.lower() or "remov" in system.lower() or "unnecessary" in system.lower()


def test_custom_mode_includes_user_instruction():
    system, _ = build_refinement_prompts_from_mode(
        input_text="Hello world.",
        mode="custom",
        custom_instruction="Make it sound like a pirate.",
        exactness="balanced",
    )
    assert "pirate" in system


def test_invalid_mode_falls_back_to_clarity():
    system, _ = build_refinement_prompts_from_mode(
        input_text="Hi.",
        mode="invalid_key",
        custom_instruction=None,
        exactness="balanced",
    )
    assert "clarity" in system.lower() or "readability" in system.lower()


def test_request_rejects_invalid_mode():
    with pytest.raises(ValidationError):
        RefineRequest(
            input_text="Hello",
            mode="invalid_mode",
        )


def test_request_requires_custom_instruction_when_mode_custom():
    with pytest.raises(ValidationError):
        RefineRequest(
            input_text="Hello",
            mode="custom",
            custom_instruction="",
        )


def test_request_accepts_text_or_input_text():
    r1 = RefineRequest(text="Hi", mode="clarity")
    assert r1.get_input_text() == "Hi"
    r2 = RefineRequest(input_text="Bye", mode="professional")
    assert r2.get_input_text() == "Bye"
    r3 = RefineRequest(text="  Override  ", input_text="Legacy")
    assert r3.get_input_text() == "Override"


def test_response_includes_mode():
    r = RefineResponse(
        refined_text="Done",
        mode="professional",
        entities_preserved=True,
        validation_passed=True,
    )
    assert r.mode == "professional"


def test_all_modes_have_instruction_or_allow_custom():
    for key in VALID_MODES:
        if key == "custom":
            continue
        config = REFINEMENT_MODES[key]
        assert "instruction" in config
        assert isinstance(config["instruction"], str)
