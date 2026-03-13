POLITE_TEMPLATE = (
    "Rewrite the following message to be polite and courteous while keeping the same intent:\n\n"
    "{text}"
)

CONCISE_TEMPLATE = (
    "Rewrite the following message to be concise and to the point while preserving key details:\n\n"
    "{text}"
)

PROFESSIONAL_TEMPLATE = (
    "Rewrite the following message to be professional and suitable for a workplace setting:\n\n"
    "{text}"
)


def get_template_for_tone(tone: str) -> str:
    normalized = tone.lower()
    if normalized == "concise":
        return CONCISE_TEMPLATE
    if normalized == "professional":
        return PROFESSIONAL_TEMPLATE
    return POLITE_TEMPLATE

