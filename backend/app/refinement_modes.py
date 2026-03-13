"""
Central config for refinement modes. Used by prompt builder to produce
strict, deterministic instructions per mode.
"""

from typing import Dict, Any

REFINEMENT_MODES: Dict[str, Dict[str, Any]] = {
    "grammar_only": {
        "label": "Fix Grammar Only",
        "description": "Correct grammar and spelling only. Do not change meaning, structure, tone, or length unless required for correctness.",
        "instruction": "Fix grammar, spelling, punctuation, and obvious sentence errors only. Preserve wording, structure, tone, and length as much as possible. Do not paraphrase or add style.",
    },
    "clarity": {
        "label": "Improve Clarity",
        "description": "Improve readability without changing meaning. Keep professional language.",
        "instruction": "Improve clarity and readability. Keep the same meaning and professional tone. Do not add new information or change the structure drastically.",
    },
    "concise": {
        "label": "Make Concise",
        "description": "Reduce unnecessary words. Preserve meaning and entities.",
        "instruction": "Shorten the text by removing unnecessary words and repetition. Preserve all meaning, key details, and do not remove important entities.",
    },
    "professional": {
        "label": "Make Professional",
        "description": "Make wording professional and workplace appropriate.",
        "instruction": "Rewrite to be professional and workplace-appropriate. Use clear, formal language suitable for business communication.",
    },
    "polite": {
        "label": "Make Polite",
        "description": "Soften language to be respectful and collaborative.",
        "instruction": "Rewrite to be polite, respectful, and collaborative. Use courteous wording while keeping the same intent.",
    },
    "assertive": {
        "label": "Make Assertive",
        "description": "Make direct, confident, and clear without being rude.",
        "instruction": "Rewrite to be direct, confident, and clear. Be assertive but not rude or aggressive.",
    },
    "bullet_points": {
        "label": "Convert to Bullet Points",
        "description": "Convert into short bullet points where appropriate.",
        "instruction": "Convert the message into clear, concise bullet points. Keep the same information and order of ideas. Use short phrases suitable for lists.",
    },
    "teams_message": {
        "label": "Rephrase for Teams Message",
        "description": "Make natural for internal chat. Concise and professional.",
        "instruction": "Rephrase for an internal Teams or chat message. Keep it concise, professional, and natural for quick reading.",
    },
    "email": {
        "label": "Rephrase for Email",
        "description": "Make suitable for email body. Natural and polished.",
        "instruction": "Rephrase for an email body. Use a natural, polished tone. Do not generate a subject line unless the original asks for one.",
    },
    "jira_comment": {
        "label": "Rephrase for Jira/Comment",
        "description": "Make suitable for work update or ticket comment. Clear, structured, action-oriented.",
        "instruction": "Rephrase for a Jira comment or work update. Be clear, structured, and action-oriented. Suited for ticket/issue context.",
    },
    "custom": {
        "label": "Custom Instruction",
        "description": "Apply your own instruction while preserving entities.",
        "instruction": "",  # Replaced by user's custom_instruction when mode is custom.
    },
}

VALID_MODES = frozenset(REFINEMENT_MODES.keys())
