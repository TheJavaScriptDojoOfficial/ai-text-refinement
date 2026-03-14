import {
  DEFAULT_BACKEND_URL,
  DEFAULT_REQUEST_TIMEOUT_MS,
  STORAGE_KEYS
} from "./constants";

export async function getBackendUrl(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([STORAGE_KEYS.backendUrl], (result) => {
      const stored = result[STORAGE_KEYS.backendUrl] as string | undefined;
      resolve(stored?.trim() || DEFAULT_BACKEND_URL);
    });
  });
}

export async function setBackendUrl(url: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set(
      { [STORAGE_KEYS.backendUrl]: url.trim() || DEFAULT_BACKEND_URL },
      () => resolve()
    );
  });
}

export async function getRequestTimeoutMs(): Promise<number> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([STORAGE_KEYS.requestTimeoutMs], (result) => {
      const stored = result[STORAGE_KEYS.requestTimeoutMs] as
        | number
        | undefined;
      const value =
        typeof stored === "number" && stored > 0 ? stored : DEFAULT_REQUEST_TIMEOUT_MS;
      resolve(value);
    });
  });
}

export async function setRequestTimeoutMs(ms: number): Promise<void> {
  const value =
    typeof ms === "number" && ms > 0 ? ms : DEFAULT_REQUEST_TIMEOUT_MS;
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [STORAGE_KEYS.requestTimeoutMs]: value }, () =>
      resolve()
    );
  });
}

export async function getBackendConfig(): Promise<{
  backendUrl: string;
  requestTimeoutMs: number;
}> {
  const [backendUrl, requestTimeoutMs] = await Promise.all([
    getBackendUrl(),
    getRequestTimeoutMs()
  ]);
  return { backendUrl, requestTimeoutMs };
}
