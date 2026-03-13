from typing import Iterable, Tuple, Optional


def _normalize_tones(tones: Optional[Iterable[str]]) -> str:
    if not tones:
        return "professional"
    unique = {t.lower().strip() for t in tones if t.strip()}
    return ", ".join(sorted(unique))


def build_refinement_prompts(
    *,
    input_text: str,
    tone: Optional[Iterable[str]],
    preserve_meaning: bool,
    preserve_keywords: bool,
    output_format: str,
    custom_instruction: Optional[str],
) -> Tuple[str, str]:
    """
    Build system and user prompts for refinement.
    """
    tone_description = _normalize_tones(tone)
    format_description = (
        "Write the answer as a single concise paragraph."
        if output_format == "paragraph"
        else "Write the answer as clear bullet points."
    )

    constraints = [
        "Do not invent facts.",
        "Do not change the actual meaning of the message.",
        "Return only the refined text.",
        "Do not include explanations, introductions, or commentary.",
        'Do not prefix with phrases like "Here is the refined version".',
    ]

    if preserve_meaning:
        constraints.append("Preserve the original intent and key details.")

    if preserve_keywords:
        constraints.append(
            "Preserve all names, IDs, URLs, numbers, and technical terms; do not replace or remove them."
        )

    system_lines = [
        "You are a careful text refinement assistant.",
        f"Your goal is to rewrite messages to be {tone_description}.",
        format_description,
        "",
        "Follow these rules strictly:",
    ] + [f"- {rule}" for rule in constraints]

    if custom_instruction:
        system_lines.append("")
        system_lines.append("Additional user instruction you must follow:")
        system_lines.append(custom_instruction.strip())

    system_prompt = "\n".join(system_lines)

    user_prompt = f"Refine the following message:\n\n{input_text.strip()}"

    return system_prompt, user_prompt


