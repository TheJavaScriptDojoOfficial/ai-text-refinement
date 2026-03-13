from typing import Iterable, Tuple, Optional


def _normalize_tones(tones: Optional[Iterable[str]]) -> str:
    if not tones:
        return "professional"
    unique = {t.lower().strip() for t in tones if t.strip()}
    return ", ".join(sorted(unique))


def build_refinement_prompts(
    *,
    input_text: str,
    tone: Iterable[str],
    length: str,
    preserve_meaning: bool,
    preserve_keywords: bool,
    preserve_names_and_ids: bool,
    keep_technical_terms: bool,
    output_format: str,
    custom_instruction: Optional[str],
    preset: Optional[str],
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
        "Return only the rewritten text and nothing else.",
        "Do not include explanations, introductions, or commentary.",
        'Do not prefix with phrases like "Here is the refined version".',
    ]

    if preserve_meaning:
        constraints.append("Preserve the original intent and key details.")

    if preserve_keywords:
        constraints.append(
            "Preserve important project-specific words and domain-specific keywords."
        )

    if preserve_names_and_ids:
        constraints.append(
            "Preserve all names, IDs, URLs, and numbers exactly; do not replace or remove them."
        )

    if keep_technical_terms:
        constraints.append("Keep technical terms unchanged unless there is a clear typo.")

    if length == "shorter":
        constraints.append(
            "Make the message shorter while keeping essential meaning and key details."
        )
    elif length == "longer":
        constraints.append(
            "Make the message slightly longer only to improve clarity, without adding new facts."
        )
    else:
        constraints.append(
            "Keep approximately the same level of detail as the original message."
        )

    system_lines = [
        "You are a careful text refinement assistant for workplace communication.",
        f"Your goal is to rewrite messages to be {tone_description}.",
        format_description,
        "",
        "Follow these rules strictly:",
    ] + [f"- {rule}" for rule in constraints]

    if custom_instruction:
        system_lines.append("")
        system_lines.append("Additional user instruction you must follow exactly:")
        system_lines.append(custom_instruction.strip())

    # The preset name is not used as an instruction, but can be useful context.
    if preset:
        system_lines.append("")
        system_lines.append(f"(Context: preset selected = {preset})")

    system_prompt = "\n".join(system_lines)

    user_prompt = f"Refine the following message:\n\n{input_text.strip()}"

    return system_prompt, user_prompt


