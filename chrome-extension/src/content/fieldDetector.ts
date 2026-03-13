export function detectEditableFields(): HTMLElement[] {
  const selectors = [
    "textarea",
    "input[type='text']",
    "input[type='search']",
    "div[contenteditable='true']"
  ];

  return Array.from(
    document.querySelectorAll<HTMLElement>(selectors.join(","))
  );
}

