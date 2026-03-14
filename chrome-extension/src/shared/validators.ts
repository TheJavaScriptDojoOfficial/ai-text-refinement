import {
  MIN_FIELD_WIDTH,
  MIN_FIELD_HEIGHT,
  SUPPORTED_INPUT_TYPES,
  MAX_REQUEST_TIMEOUT_MS,
  MIN_TIMEOUT_MS
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

// --- Settings validators ---

export function isValidUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const u = new URL(trimmed);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeBackendUrl(value: string): string {
  return value.replace(/\/+$/, "").trim() || value.trim();
}

export function isValidTimeout(value: number): boolean {
  return (
    typeof value === "number" && value > 0 && value <= MAX_REQUEST_TIMEOUT_MS
  );
}

const LENGTH_OPTIONS = ["shorter", "same", "longer"] as const;

export function isValidLengthOption(value: string): value is "shorter" | "same" | "longer" {
  return LENGTH_OPTIONS.includes(value as (typeof LENGTH_OPTIONS)[number]);
}

export function isValidToneId(
  value: string,
  availableToneIds?: string[]
): boolean {
  const id = value.trim().toLowerCase();
  if (!id) return false;
  if (availableToneIds && availableToneIds.length > 0) {
    return availableToneIds.includes(id);
  }
  return id.length <= 64;
}

/** Normalize blacklist input (newline or comma separated) to string[]. */
export function normalizeDomainBlacklist(input: string | string[]): string[] {
  if (Array.isArray(input)) {
    return input
      .flatMap((s) => s.split(/[\n,]/))
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }
  return input
    .split(/[\n,]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Simple hostname pattern: non-empty, no spaces, reasonable length. */
export function isValidHostnamePattern(value: string): boolean {
  const t = value.trim().toLowerCase();
  if (!t) return false;
  if (/\s/.test(t)) return false;
  return t.length <= 253;
}

// --- Runtime / backend config validators (Step 8) ---

export function validateBackendUrl(value: string): {
  valid: boolean;
  normalizedValue?: string;
  error?: string;
} {
  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: false, error: "Backend URL is required." };
  }
  try {
    const u = new URL(trimmed);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return { valid: false, error: "URL must use http or https." };
    }
    const normalized = trimmed.replace(/\/+$/, "") || trimmed;
    return { valid: true, normalizedValue: normalized };
  } catch {
    return { valid: false, error: "Invalid URL." };
  }
}

export function clampTimeoutMs(value: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 30000;
  }
  if (value < MIN_TIMEOUT_MS) return MIN_TIMEOUT_MS;
  if (value > MAX_REQUEST_TIMEOUT_MS) return MAX_REQUEST_TIMEOUT_MS;
  return Math.floor(value);
}

export function validateSettingsForRuntime(settings: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!settings || typeof settings !== "object") {
    return { valid: false, errors: ["Settings object is missing."] };
  }
  const s = settings as Record<string, unknown>;
  const urlResult = validateBackendUrl(String(s.backendUrl ?? ""));
  if (!urlResult.valid && s.backendUrl !== undefined && s.backendUrl !== "") {
    errors.push(urlResult.error ?? "Invalid backend URL.");
  }
  const timeout = Number(s.requestTimeoutMs);
  if (
    typeof s.requestTimeoutMs !== "undefined" &&
    (Number.isNaN(timeout) || timeout < MIN_TIMEOUT_MS || timeout > MAX_REQUEST_TIMEOUT_MS)
  ) {
    errors.push("Request timeout is out of range.");
  }
  return {
    valid: errors.length === 0,
    errors
  };
}
