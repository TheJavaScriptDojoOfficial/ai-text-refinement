const BACKEND_URL_KEY = "backendUrl";
const DEFAULT_BACKEND_URL = "http://127.0.0.1:8000";

function getBackendUrlInput(): HTMLInputElement {
  const input = document.getElementById("backend-url");
  if (!(input instanceof HTMLInputElement)) {
    throw new Error("Backend URL input not found");
  }
  return input;
}

function getStatusElement(): HTMLElement | null {
  const el = document.getElementById("status");
  return el instanceof HTMLElement ? el : null;
}

async function loadSettings(): Promise<void> {
  const input = getBackendUrlInput();

  chrome.storage.sync.get([BACKEND_URL_KEY], (result) => {
    const stored = result[BACKEND_URL_KEY] as string | undefined;
    input.value = stored || DEFAULT_BACKEND_URL;
  });
}

async function saveSettings(): Promise<void> {
  const input = getBackendUrlInput();
  const status = getStatusElement();

  const value = input.value.trim() || DEFAULT_BACKEND_URL;

  chrome.storage.sync.set({ [BACKEND_URL_KEY]: value }, () => {
    if (status) {
      status.textContent = "Settings saved.";
      setTimeout(() => {
        status.textContent = "";
      }, 2000);
    }
  });
}

function init(): void {
  document.addEventListener("DOMContentLoaded", () => {
    void loadSettings();

    const saveButton = document.getElementById("save-button");
    if (saveButton instanceof HTMLButtonElement) {
      saveButton.addEventListener("click", () => {
        void saveSettings();
      });
    }
  });
}

init();

