import {
  getBackendUrl,
  setBackendUrl,
  getRequestTimeoutMs,
  setRequestTimeoutMs
} from "../shared/storage";
import {
  DEFAULT_BACKEND_URL,
  DEFAULT_REQUEST_TIMEOUT_MS
} from "../shared/constants";

const MIN_TIMEOUT_MS = 5000;
const MAX_TIMEOUT_MS = 120000;

function getBackendUrlInput(): HTMLInputElement {
  const input = document.getElementById("backend-url");
  if (!(input instanceof HTMLInputElement)) {
    throw new Error("Backend URL input not found");
  }
  return input;
}

function getTimeoutInput(): HTMLInputElement {
  const input = document.getElementById("request-timeout");
  if (!(input instanceof HTMLInputElement)) {
    throw new Error("Request timeout input not found");
  }
  return input;
}

function getStatusElement(): HTMLElement | null {
  const el = document.getElementById("status");
  return el instanceof HTMLElement ? el : null;
}

function isValidUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  try {
    const u = new URL(trimmed);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function parseTimeout(value: string): number {
  const n = parseInt(value, 10);
  if (Number.isNaN(n) || n < MIN_TIMEOUT_MS) return DEFAULT_REQUEST_TIMEOUT_MS;
  if (n > MAX_TIMEOUT_MS) return MAX_TIMEOUT_MS;
  return n;
}

async function loadSettings(): Promise<void> {
  const urlInput = getBackendUrlInput();
  const timeoutInput = getTimeoutInput();

  const [url, timeout] = await Promise.all([
    getBackendUrl(),
    getRequestTimeoutMs()
  ]);
  urlInput.value = url;
  timeoutInput.value = String(timeout);
}

async function saveSettings(): Promise<void> {
  const urlInput = getBackendUrlInput();
  const timeoutInput = getTimeoutInput();
  const status = getStatusElement();

  const urlValue = urlInput.value.trim() || DEFAULT_BACKEND_URL;
  if (!isValidUrl(urlValue)) {
    if (status) {
      status.textContent = "Please enter a valid http(s) URL.";
      status.setAttribute("class", "status status--error");
    }
    return;
  }

  const timeoutMs = parseTimeout(timeoutInput.value);

  await setBackendUrl(urlValue);
  await setRequestTimeoutMs(timeoutMs);

  if (status) {
    status.textContent = "Settings saved.";
    status.setAttribute("class", "status");
    setTimeout(() => {
      status.textContent = "";
    }, 2000);
  }
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
