import re
from typing import Dict


PLACEHOLDER_REGEX = re.compile(r"__[A-Z]+_\d+__")


def _count_placeholders(text: str) -> Dict[str, int]:
  counts: Dict[str, int] = {}
  for match in PLACEHOLDER_REGEX.finditer(text):
      key = match.group(0)
      counts[key] = counts.get(key, 0) + 1
  return counts


def validate_output(
    original_masked: str,
    refined_masked: str,
    entities: Dict[str, str],
) -> bool:
    """
    Lightweight validation:
    - All known placeholders still exist in the refined text
    - Placeholder counts do not decrease
    - No unknown placeholder types are introduced
    """
    if not entities:
        return True

    original_counts = _count_placeholders(original_masked)
    refined_counts = _count_placeholders(refined_masked)

    # All known placeholders must still exist with at least the same count
    for placeholder in entities.keys():
        if placeholder not in refined_counts:
            return False
        if refined_counts[placeholder] < original_counts.get(placeholder, 0):
            return False

    # No unexpected new placeholder keys that we didn't generate
    for placeholder in refined_counts.keys():
        if placeholder not in entities:
            return False

    return True

