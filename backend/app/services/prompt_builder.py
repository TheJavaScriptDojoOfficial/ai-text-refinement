from . import text_templates


def build_refinement_prompt(text: str, tone: str) -> str:
    template = text_templates.get_template_for_tone(tone)
    return template.format(text=text)

