import type { ExtensionSettings, PartialExtensionSettings } from "../shared/types";
import {
  getSettings,
  saveSettings,
  resetSettings as resetStorage,
  getDefaultSettings
} from "../shared/storage";
import {
  DEFAULT_BACKEND_URL,
  DEFAULT_REQUEST_TIMEOUT_MS,
  HEALTH_ENDPOINT_PATH,
  DEFAULT_TONE_OPTIONS
} from "../shared/constants";
import {
  isValidUrl,
  normalizeBackendUrl,
  isValidTimeout,
  isValidLengthOption,
  normalizeDomainBlacklist,
  isValidHostnamePattern
} from "../shared/validators";

const MIN_TIMEOUT_MS = 5000;
const MAX_TIMEOUT_MS = 300000;

function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el || !(el instanceof HTMLElement)) {
    throw new Error(`Element #${id} not found`);
  }
  return el as T;
}

function getStatusEl(): HTMLElement {
  return getEl<HTMLElement>("status");
}

function setStatus(
  message: string,
  type: "success" | "error" | "info" | ""
): void {
  const el = getStatusEl();
  el.textContent = message;
  el.className = "status-message";
  if (type) {
    el.classList.add(`status-message--${type}`);
  }
  if (message) {
    setTimeout(() => {
      el.textContent = "";
      el.className = "status-message";
    }, 5000);
  }
}

function parseTimeoutInput(value: string): number {
  const n = parseInt(value, 10);
  if (Number.isNaN(n) || n < MIN_TIMEOUT_MS) return DEFAULT_REQUEST_TIMEOUT_MS;
  if (n > MAX_TIMEOUT_MS) return MAX_TIMEOUT_MS;
  return n;
}

/** Read current form values into a partial settings object (raw, not yet validated). */
function readFormValues(): PartialExtensionSettings & { domainBlacklistText?: string } {
  const backendUrl = (getEl<HTMLInputElement>("backend-url").value || "").trim();
  const timeoutStr = getEl<HTMLInputElement>("request-timeout").value;
  const requestTimeoutMs = parseTimeoutInput(timeoutStr);
  const defaultTone = (getEl<HTMLSelectElement>("default-tone").value || "").trim();
  const defaultLength = (getEl<HTMLSelectElement>("default-length").value || "").trim();
  const preserveEntities = getEl<HTMLInputElement>("preserve-entities").checked;
  const preserveUrls = getEl<HTMLInputElement>("preserve-urls").checked;
  const preserveIds = getEl<HTMLInputElement>("preserve-ids").checked;
  const enabled = getEl<HTMLInputElement>("enabled").checked;
  const autoShowTrigger = getEl<HTMLInputElement>("auto-show-trigger").checked;
  const domainBlacklistText = getEl<HTMLTextAreaElement>("domain-blacklist").value;

  return {
    backendUrl: backendUrl || undefined,
    requestTimeoutMs,
    defaultTone: defaultTone || undefined,
    defaultLengthOption: isValidLengthOption(defaultLength) ? defaultLength : undefined,
    preserveEntities,
    preserveUrls,
    preserveIds,
    enabled,
    autoShowTrigger,
    domainBlacklistText
  };
}

/** Parse blacklist textarea into string[]. */
function parseBlacklistTextarea(value: string): string[] {
  return normalizeDomainBlacklist(value);
}

/** Validate form values; returns record of field errors (empty if valid). */
function validateFormValues(
  raw: ReturnType<typeof readFormValues>
): Partial<Record<keyof ExtensionSettings, string>> {
  const errors: Partial<Record<keyof ExtensionSettings, string>> = {};

  const url = raw.backendUrl?.trim() ?? "";
  if (url && !isValidUrl(url)) {
    errors.backendUrl = "Please enter a valid http(s) URL.";
  }

  const timeout = raw.requestTimeoutMs ?? 0;
  if (!isValidTimeout(timeout)) {
    errors.requestTimeoutMs = `Timeout must be between ${MIN_TIMEOUT_MS} and ${MAX_TIMEOUT_MS} ms.`;
  }

  const toneIds: string[] = DEFAULT_TONE_OPTIONS.map((o) => o.id);
  if (raw.defaultTone && !raw.defaultTone.trim()) {
    // empty is ok, will use default
  } else if (raw.defaultTone && !toneIds.includes(raw.defaultTone.trim())) {
    errors.defaultTone = "Unknown tone.";
  }

  if (raw.domainBlacklistText !== undefined) {
    const list = parseBlacklistTextarea(raw.domainBlacklistText);
    for (const entry of list) {
      if (!isValidHostnamePattern(entry)) {
        errors.domainBlacklist = "Invalid hostname in blacklist.";
        break;
      }
    }
  }

  return errors;
}

/** Write settings to form. */
function writeFormValues(settings: ExtensionSettings): void {
  getEl<HTMLInputElement>("backend-url").value = settings.backendUrl;
  getEl<HTMLInputElement>("request-timeout").value = String(settings.requestTimeoutMs);
  getEl<HTMLSelectElement>("default-tone").value = settings.defaultTone;
  getEl<HTMLSelectElement>("default-length").value = settings.defaultLengthOption;
  getEl<HTMLInputElement>("preserve-entities").checked = settings.preserveEntities;
  getEl<HTMLInputElement>("preserve-urls").checked = settings.preserveUrls;
  getEl<HTMLInputElement>("preserve-ids").checked = settings.preserveIds;
  getEl<HTMLInputElement>("enabled").checked = settings.enabled;
  getEl<HTMLInputElement>("auto-show-trigger").checked = settings.autoShowTrigger;
  getEl<HTMLTextAreaElement>("domain-blacklist").value =
    settings.domainBlacklist.join("\n");
}

async function loadSettings(): Promise<void> {
  const settings = await getSettings();
  writeFormValues(settings);
}

async function saveFormSettings(): Promise<void> {
  const raw = readFormValues();
  const errors = validateFormValues(raw);

  if (Object.keys(errors).length > 0) {
    const first = Object.values(errors)[0];
    setStatus(first ?? "Please fix the errors above.", "error");
    return;
  }

  const backendUrl = raw.backendUrl?.trim()
    ? normalizeBackendUrl(raw.backendUrl.trim()) || DEFAULT_BACKEND_URL
    : DEFAULT_BACKEND_URL;
  const requestTimeoutMs = raw.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
  const defaultTone = raw.defaultTone?.trim() || "professional";
  const defaultLengthOption = raw.defaultLengthOption ?? "same";
  const domainBlacklist =
    raw.domainBlacklistText !== undefined
      ? parseBlacklistTextarea(raw.domainBlacklistText)
      : undefined;

  setStatus("Saving…", "info");
  try {
    await saveSettings({
      backendUrl,
      requestTimeoutMs,
      defaultTone,
      defaultLengthOption,
      preserveEntities: raw.preserveEntities,
      preserveUrls: raw.preserveUrls,
      preserveIds: raw.preserveIds,
      enabled: raw.enabled,
      autoShowTrigger: raw.autoShowTrigger,
      domainBlacklist
    });
    setStatus("Settings saved.", "success");
  } catch {
    setStatus("Failed to save settings.", "error");
  }
}

async function resetForm(): Promise<void> {
  setStatus("Resetting…", "info");
  try {
    const defaults = await resetStorage();
    writeFormValues(defaults);
    setStatus("Settings reset to defaults.", "success");
  } catch {
    setStatus("Failed to reset settings.", "error");
  }
}

/** Test backend connection using current form URL and timeout. */
async function testBackendConnection(): Promise<void> {
  const raw = readFormValues();
  const urlRaw = raw.backendUrl?.trim() || DEFAULT_BACKEND_URL;
  if (!isValidUrl(urlRaw)) {
    setStatus("Invalid backend URL.", "error");
    return;
  }

  const base = urlRaw.replace(/\/+$/, "");
  const healthUrl = `${base}${HEALTH_ENDPOINT_PATH.startsWith("/") ? "" : "/"}${HEALTH_ENDPOINT_PATH}`;
  const timeoutMs = raw.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;

  const button = getEl<HTMLButtonElement>("test-backend-button");
  button.disabled = true;
  setStatus("Testing connection…", "info");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(healthUrl, {
      method: "GET",
      signal: controller.signal,
      headers: { Accept: "application/json" }
    });
    clearTimeout(timeoutId);
    const text = await res.text();
    if (res.ok) {
      let modelReady: boolean | undefined;
      try {
        const data = text ? JSON.parse(text) : null;
        modelReady =
          data && typeof data === "object" && "model_ready" in data
            ? Boolean((data as { model_ready?: unknown }).model_ready)
            : undefined;
      } catch {
        modelReady = undefined;
      }
      if (modelReady === false) {
        setStatus("Backend reachable, but model is not ready.", "error");
      } else {
        setStatus("Backend connection successful.", "success");
      }
    } else {
      setStatus("Could not connect to backend.", "error");
    }
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      setStatus("Request timed out.", "error");
    } else {
      setStatus("Could not connect to backend.", "error");
    }
  } finally {
    button.disabled = false;
  }
}

function init(): void {
  document.addEventListener("DOMContentLoaded", () => {
    void loadSettings();

    getEl<HTMLButtonElement>("save-button").addEventListener("click", () => {
      void saveFormSettings();
    });

    getEl<HTMLButtonElement>("reset-button").addEventListener("click", () => {
      void resetForm();
    });

    getEl<HTMLButtonElement>("test-backend-button").addEventListener("click", () => {
      void testBackendConnection();
    });
  });
}

init();
