import re
from dataclasses import dataclass
from typing import Dict, Tuple


PLACEHOLDER_PREFIXES = {
    "url": "__URL_",
    "email": "__EMAIL_",
    "uuid": "__UUID_",
    "id": "__ID_",
    "number": "__NUMBER_",
    "path": "__PATH_",
    "version": "__VER_",
    "code": "__CODE_",
    "tech": "__TECH_",
}


@dataclass
class MaskResult:
    masked_text: str
    entities: Dict[str, str]


def _build_placeholder(entity_type: str, index: int) -> str:
    prefix = PLACEHOLDER_PREFIXES[entity_type]
    return f"{prefix}{index}__"


def mask_entities(text: str) -> MaskResult:
    """
    Detect important entities and replace them with stable placeholders.
    """

    entities: Dict[str, str] = {}
    counters = {k: 1 for k in PLACEHOLDER_PREFIXES.keys()}

    masked = text

    def apply_pattern(pattern: re.Pattern, entity_type: str) -> None:
        nonlocal masked

        def replacer(match: re.Match) -> str:
            value = match.group(0)
            idx = counters[entity_type]
            counters[entity_type] += 1
            placeholder = _build_placeholder(entity_type, idx)
            entities[placeholder] = value
            return placeholder

        masked = pattern.sub(replacer, masked)

    # Code blocks (triple backticks and inline backticks)
    code_block_pattern = re.compile(r"```[\s\S]*?```", re.MULTILINE)
    inline_code_pattern = re.compile(r"`[^`]+`")

    # URLs and emails
    url_pattern = re.compile(r"https?://[^\s]+", re.IGNORECASE)
    email_pattern = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")

    # UUIDs
    uuid_pattern = re.compile(
        r"\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\b"
    )

    # Version numbers like 1.2.3 or v1.2.3
    version_pattern = re.compile(r"\bv?\d+\.\d+(\.\d+)?\b")

    # File paths (simple heuristic for *nix and Windows)
    path_pattern = re.compile(r"(\b\/[^\s]+|\b[A-Za-z]:\\[^\s]+)")

    # IDs (tokens ending with Id/ID or containing id_, userId, etc.)
    id_pattern = re.compile(r"\b[a-zA-Z0-9_-]*(?:id|ID)[a-zA-Z0-9_-]*\b")

    # Numbers (avoid already-masked placeholders by excluding leading underscores)
    number_pattern = re.compile(r"(?<!_)\b\d+(?:\.\d+)?\b")

    # Technical tokens
    tech_tokens = [
        "React",
        "Next.js",
        "Node.js",
        "TypeScript",
        "JavaScript",
        "FastAPI",
        "Docker",
        "Kubernetes",
    ]
    tech_pattern = re.compile(r"\b(" + "|".join(re.escape(t) for t in tech_tokens) + r")\b")

    # Apply patterns in a specific order to avoid overlaps
    for pattern, etype in [
        (code_block_pattern, "code"),
        (inline_code_pattern, "code"),
        (url_pattern, "url"),
        (email_pattern, "email"),
        (uuid_pattern, "uuid"),
        (path_pattern, "path"),
        (version_pattern, "version"),
        (id_pattern, "id"),
        (number_pattern, "number"),
        (tech_pattern, "tech"),
    ]:
        apply_pattern(pattern, etype)

    return MaskResult(masked_text=masked, entities=entities)


def restore_entities(text: str, entities: Dict[str, str]) -> str:
    """
    Replace placeholders with original entity values.
    """
    restored = text
    for placeholder, value in entities.items():
        restored = restored.replace(placeholder, value)
    return restored

