import {
  MIN_FIELD_WIDTH,
  MIN_FIELD_HEIGHT,
  SUPPORTED_INPUT_TYPES
} from "./constants";

export function isHTMLElement(node: unknown): node is HTMLElement {
  return node instanceof HTMLElement;
}

export function isHTMLInputElement(node: unknown): node is HTMLInputElement {
  return node instanceof HTMLInputElement;
}

export function isHTMLTextAreaElement(
  node: unknown
): node is HTMLTextAreaElement {
  return node instanceof HTMLTextAreaElement;
}

export function isSupportedInputType(input: HTMLInputElement): boolean {
  const type = (input.type ?? "text").toLowerCase();
  return (SUPPORTED_INPUT_TYPES as readonly string[]).includes(type);
}

export function isDisabledElement(el: HTMLElement): boolean {
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    return el.disabled;
  }
  return (el as HTMLInputElement).disabled === true;
}

export function isReadOnlyElement(el: HTMLElement): boolean {
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    return el.readOnly;
  }
  return (el as HTMLInputElement).readOnly === true;
}

/** Visible: not display:none, not visibility:hidden, not opacity:0, non-zero bounding box. */
export function isVisibleElement(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  if (style.display === "none") return false;
  if (style.visibility === "hidden") return false;
  const opacity = parseFloat(style.opacity);
  if (Number.isNaN(opacity) || opacity === 0) return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

export function isLargeEnoughElement(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  return rect.width >= MIN_FIELD_WIDTH && rect.height >= MIN_FIELD_HEIGHT;
}

export function isNonEmptyText(value: string | null | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}
