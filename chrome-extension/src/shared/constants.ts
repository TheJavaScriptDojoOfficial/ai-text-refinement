export const DEFAULT_BACKEND_URL = "http://127.0.0.1:8000";
export const STORAGE_KEYS = {
  backendUrl: "backendUrl"
} as const;

/** Input type attribute values we treat as editable text fields. */
export const SUPPORTED_INPUT_TYPES = [
  "text",
  "search",
  "email",
  "url",
  "tel"
] as const;

/** Minimum character length for a field to be considered actionable (e.g. for refine). */
export const MIN_TEXT_LENGTH_TO_BE_ACTIONABLE = 1;

/** Minimum computed width (px) for a field to be considered eligible. */
export const MIN_FIELD_WIDTH = 120;

/** Minimum computed height (px) for a field to be considered eligible. */
export const MIN_FIELD_HEIGHT = 28;

/** Attribute used to mark the extension's UI root so we can ignore it in detection. */
export const EXTENSION_UI_ROOT_ATTR = "data-ai-refiner-root";

/** Floating trigger UI constants. */
export const AI_REFINER_ROOT_ATTR = "data-ai-refiner-root";
export const AI_REFINER_ROOT_VALUE = "true";
/** Selector for the extension root (querying extension-owned DOM). */
export const AI_REFINER_ROOT_SELECTOR = `[${AI_REFINER_ROOT_ATTR}="${AI_REFINER_ROOT_VALUE}"]`;

export const FLOATING_TRIGGER_ID = "ai-refiner-floating-trigger";
export const FLOATING_TRIGGER_SIZE = 32;
export const FLOATING_TRIGGER_OFFSET_X = 8;
export const FLOATING_TRIGGER_OFFSET_Y = 8;
export const FLOATING_TRIGGER_Z_INDEX = 2147483647;
/** Use requestAnimationFrame for scroll/resize position updates. */
export const POSITION_UPDATE_RAF = true;
