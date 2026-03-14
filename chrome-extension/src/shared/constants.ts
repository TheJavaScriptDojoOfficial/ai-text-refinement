export const DEFAULT_BACKEND_URL = "http://127.0.0.1:8000";
export const STORAGE_KEYS = {
  backendUrl: "backendUrl",
  requestTimeoutMs: "requestTimeoutMs"
} as const;

/** Single key for all extension settings in chrome.storage.local. */
export const SETTINGS_STORAGE_KEY = "aiRefinerSettings";

/** Canonical defaults for extension settings. */
export const DEFAULT_DEFAULT_TONE = "professional";
export const DEFAULT_AUTO_SHOW_TRIGGER = true;
export const DEFAULT_EXTENSION_ENABLED = true;
export const DEFAULT_DOMAIN_BLACKLIST: string[] = [];

/** Backend API paths (centralized for easy adjustment). */
export const HEALTH_ENDPOINT_PATH = "/api/health";
export const REFINE_ENDPOINT_PATH = "/api/refine";
export const DEFAULT_REQUEST_TIMEOUT_MS = 30000;
export const DEFAULT_PRESERVE_ENTITIES = true;
export const DEFAULT_PRESERVE_URLS = true;
export const DEFAULT_PRESERVE_IDS = true;
export const DEFAULT_LENGTH_OPTION = "same" as const;

/** Health check and retry behavior. */
export const HEALTH_CHECK_CACHE_TTL_MS = 30000;
export const STARTUP_HEALTH_CHECK_ENABLED = true;
export const PRE_REFINE_HEALTH_CHECK_ENABLED = false;
export const POPUP_ERROR_AUTO_CLEAR_MS = 0;
export const MIN_TIMEOUT_MS = 1000;

/** User-facing error messages (centralized). */
export const BACKEND_UNREACHABLE_MESSAGE =
  "Local refinement server is not running.";
export const BACKEND_TIMEOUT_MESSAGE =
  "The local refinement request timed out.";
export const BACKEND_NOT_READY_MESSAGE = "The local model is not ready yet.";
export const INVALID_BACKEND_RESPONSE_MESSAGE =
  "The backend returned an invalid response.";
export const INVALID_SETTINGS_MESSAGE = "Extension settings are invalid.";
export const REPLACEMENT_FAILED_MESSAGE =
  "Refined text was received, but applying it failed.";
export const GENERIC_REFINEMENT_ERROR_MESSAGE =
  "Refinement failed. Please try again.";
export const BACKEND_GENERIC_ERROR_MESSAGE = GENERIC_REFINEMENT_ERROR_MESSAGE;

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

/** Tone popup UI constants. */
export const TONE_POPUP_ID = "ai-refiner-tone-popup";
export const TONE_POPUP_MIN_WIDTH = 220;
export const TONE_POPUP_MAX_WIDTH = 280;
export const TONE_POPUP_Z_INDEX = 2147483647;
export const TONE_POPUP_OFFSET_Y = 10;
export const TONE_POPUP_VIEWPORT_PADDING = 8;

export const TONE_POPUP_CLASS = "ai-refiner-popup";
export const TONE_POPUP_HIDDEN_CLASS = "ai-refiner-popup--hidden";

/** Max timeout (ms) for backend requests (validators). */
export const MAX_REQUEST_TIMEOUT_MS = 300000;
export const MAX_TIMEOUT_MS = MAX_REQUEST_TIMEOUT_MS;

export const DEFAULT_TONE_OPTIONS = [
  { id: "professional", label: "Professional", description: "Clear and work-appropriate" },
  { id: "friendly", label: "Friendly", description: "Warm and approachable" },
  { id: "polite", label: "Polite", description: "Softer and more courteous" },
  { id: "concise", label: "Concise", description: "Shorter and more direct" },
  { id: "stronger", label: "Stronger", description: "More confident and firm" },
  { id: "grammar", label: "Grammar Fix", description: "Correct grammar and phrasing" }
] as const;
