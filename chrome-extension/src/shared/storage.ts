import type { ExtensionSettings, PartialExtensionSettings } from "./types";
import {
  DEFAULT_BACKEND_URL,
  DEFAULT_REQUEST_TIMEOUT_MS,
  DEFAULT_DEFAULT_TONE,
  DEFAULT_AUTO_SHOW_TRIGGER,
  DEFAULT_PRESERVE_ENTITIES,
  DEFAULT_PRESERVE_URLS,
  DEFAULT_PRESERVE_IDS,
  DEFAULT_LENGTH_OPTION,
  DEFAULT_EXTENSION_ENABLED,
  DEFAULT_DOMAIN_BLACKLIST,
  SETTINGS_STORAGE_KEY
} from "./constants";
import {
  validateBackendUrl,
  clampTimeoutMs,
  isValidLengthOption,
  normalizeDomainBlacklist
} from "./validators";

export function getDefaultSettings(): ExtensionSettings {
  return {
    backendUrl: DEFAULT_BACKEND_URL,
    requestTimeoutMs: DEFAULT_REQUEST_TIMEOUT_MS,
    defaultTone: DEFAULT_DEFAULT_TONE,
    autoShowTrigger: DEFAULT_AUTO_SHOW_TRIGGER,
    preserveEntities: DEFAULT_PRESERVE_ENTITIES,
    preserveUrls: DEFAULT_PRESERVE_URLS,
    preserveIds: DEFAULT_PRESERVE_IDS,
    defaultLengthOption: DEFAULT_LENGTH_OPTION,
    enabled: DEFAULT_EXTENSION_ENABLED,
    domainBlacklist: [...DEFAULT_DOMAIN_BLACKLIST]
  };
}

function sanitizeStored(raw: unknown): ExtensionSettings {
  const defaults = getDefaultSettings();
  if (raw === null || typeof raw !== "object") {
    return defaults;
  }
  const o = raw as Record<string, unknown>;

  let backendUrl = defaults.backendUrl;
  if (typeof o.backendUrl === "string" && o.backendUrl.trim()) {
    const result = validateBackendUrl(o.backendUrl.trim());
    backendUrl = result.valid && result.normalizedValue
      ? result.normalizedValue
      : DEFAULT_BACKEND_URL;
  }

  const requestTimeoutMs = clampTimeoutMs(
    typeof o.requestTimeoutMs === "number" ? o.requestTimeoutMs : defaults.requestTimeoutMs
  );

  const defaultTone =
    typeof o.defaultTone === "string" && o.defaultTone.trim()
      ? o.defaultTone.trim()
      : defaults.defaultTone;

  const autoShowTrigger =
    typeof o.autoShowTrigger === "boolean"
      ? o.autoShowTrigger
      : defaults.autoShowTrigger;

  const preserveEntities =
    typeof o.preserveEntities === "boolean"
      ? o.preserveEntities
      : defaults.preserveEntities;

  const preserveUrls =
    typeof o.preserveUrls === "boolean" ? o.preserveUrls : defaults.preserveUrls;

  const preserveIds =
    typeof o.preserveIds === "boolean" ? o.preserveIds : defaults.preserveIds;

  const defaultLengthOption =
    typeof o.defaultLengthOption === "string" &&
    isValidLengthOption(o.defaultLengthOption)
      ? o.defaultLengthOption
      : defaults.defaultLengthOption;

  const enabled =
    typeof o.enabled === "boolean" ? o.enabled : defaults.enabled;

  let domainBlacklist: string[] = defaults.domainBlacklist;
  if (Array.isArray(o.domainBlacklist)) {
    try {
      domainBlacklist = (o.domainBlacklist as unknown[])
        .filter((x): x is string => typeof x === "string" && String(x).trim() !== "")
        .map((s) => String(s).trim().toLowerCase());
    } catch {
      domainBlacklist = [];
    }
  }

  return {
    backendUrl,
    requestTimeoutMs,
    defaultTone,
    autoShowTrigger,
    preserveEntities,
    preserveUrls,
    preserveIds,
    defaultLengthOption,
    enabled,
    domainBlacklist
  };
}

export function getSettings(): Promise<ExtensionSettings> {
  return new Promise((resolve) => {
    chrome.storage.local.get([SETTINGS_STORAGE_KEY], (result) => {
      const stored = result[SETTINGS_STORAGE_KEY];
      resolve(sanitizeStored(stored));
    });
  });
}

export async function saveSettings(
  partial: PartialExtensionSettings
): Promise<ExtensionSettings> {
  const current = await getSettings();
  const merged: ExtensionSettings = {
    ...current,
    ...partial
  };
  const sanitized = sanitizeStored(merged);
  return new Promise((resolve) => {
    chrome.storage.local.set(
      { [SETTINGS_STORAGE_KEY]: sanitized },
      () => resolve(sanitized)
    );
  });
}

export async function resetSettings(): Promise<ExtensionSettings> {
  const defaults = getDefaultSettings();
  return new Promise((resolve) => {
    chrome.storage.local.set(
      { [SETTINGS_STORAGE_KEY]: defaults },
      () => resolve(defaults)
    );
  });
}

/** Compatibility: delegate to getSettings(). */
export async function getBackendUrl(): Promise<string> {
  const s = await getSettings();
  return s.backendUrl;
}

/** Compatibility: delegate to getSettings(). */
export async function setBackendUrl(url: string): Promise<void> {
  await saveSettings({ backendUrl: url.trim() || DEFAULT_BACKEND_URL });
}

/** Compatibility: delegate to getSettings(). */
export async function getRequestTimeoutMs(): Promise<number> {
  const s = await getSettings();
  return s.requestTimeoutMs;
}

/** Compatibility: delegate to getSettings(). */
export async function setRequestTimeoutMs(ms: number): Promise<void> {
  const value =
    typeof ms === "number" && ms > 0 ? ms : DEFAULT_REQUEST_TIMEOUT_MS;
  await saveSettings({ requestTimeoutMs: value });
}

/** Compatibility: backend config for API client. */
export async function getBackendConfig(): Promise<{
  backendUrl: string;
  requestTimeoutMs: number;
}> {
  const s = await getSettings();
  return {
    backendUrl: s.backendUrl,
    requestTimeoutMs: s.requestTimeoutMs
  };
}
