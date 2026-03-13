import { DEFAULT_BACKEND_URL, STORAGE_KEYS } from "./constants";

export async function getBackendUrl(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([STORAGE_KEYS.backendUrl], (result) => {
      const stored = result[STORAGE_KEYS.backendUrl] as string | undefined;
      resolve(stored || DEFAULT_BACKEND_URL);
    });
  });
}

