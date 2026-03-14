import type {
  HealthResponse,
  RefineRequestPayload,
  RefineSuccessResponse,
  RefineErrorResponse,
  RefineMode
} from "../shared/types";
import {
  HEALTH_ENDPOINT_PATH,
  REFINE_ENDPOINT_PATH,
  BACKEND_UNREACHABLE_MESSAGE,
  BACKEND_TIMEOUT_MESSAGE,
  BACKEND_GENERIC_ERROR_MESSAGE,
  DEFAULT_PRESERVE_ENTITIES,
  DEFAULT_PRESERVE_URLS,
  DEFAULT_PRESERVE_IDS,
  DEFAULT_LENGTH_OPTION
} from "../shared/constants";
import { getBackendConfig } from "../shared/storage";

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "") || url;
}

function buildUrl(baseUrl: string, path: string): string {
  const base = trimTrailingSlash(baseUrl);
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

async function fetchJsonWithTimeout<T>(
  url: string,
  options: RequestInit & { timeoutMs: number }
): Promise<T> {
  const { timeoutMs, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const text = await res.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      if (!res.ok) {
        throw new Error(BACKEND_GENERIC_ERROR_MESSAGE);
      }
      throw new Error("Invalid JSON response");
    }
    if (!res.ok) {
      const errBody = data as RefineErrorResponse | { error?: string; message?: string };
      const msg =
        (errBody && (errBody.error ?? errBody.message)) ||
        BACKEND_GENERIC_ERROR_MESSAGE;
      throw new Error(msg);
    }
    return data as T;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        throw new Error(BACKEND_TIMEOUT_MESSAGE);
      }
      if (
        err.message === BACKEND_TIMEOUT_MESSAGE ||
        err.message === BACKEND_GENERIC_ERROR_MESSAGE
      ) {
        throw err;
      }
      throw new Error(BACKEND_UNREACHABLE_MESSAGE);
    }
    throw new Error(BACKEND_GENERIC_ERROR_MESSAGE);
  }
}

export class LocalRefinerApiClient {
  async checkHealth(): Promise<HealthResponse> {
    const { backendUrl, requestTimeoutMs } = await getBackendConfig();
    const url = buildUrl(backendUrl, HEALTH_ENDPOINT_PATH);
    try {
      const data = await fetchJsonWithTimeout<HealthResponse>(url, {
        method: "GET",
        timeoutMs: requestTimeoutMs,
        headers: { Accept: "application/json" }
      });
      return data;
    } catch (err) {
      if (err instanceof Error && err.message === BACKEND_TIMEOUT_MESSAGE) {
        throw new Error(BACKEND_UNREACHABLE_MESSAGE);
      }
      throw new Error(BACKEND_UNREACHABLE_MESSAGE);
    }
  }

  async refineText(
    payload: RefineRequestPayload
  ): Promise<RefineSuccessResponse> {
    const { backendUrl, requestTimeoutMs } = await getBackendConfig();
    const url = buildUrl(backendUrl, REFINE_ENDPOINT_PATH);
    let res: RefineSuccessResponse | RefineErrorResponse;
    try {
      res = await fetchJsonWithTimeout<RefineSuccessResponse | RefineErrorResponse>(
        url,
        {
          method: "POST",
          timeoutMs: requestTimeoutMs,
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload)
        }
      );
    } catch (err) {
      if (err instanceof Error && err.message === BACKEND_TIMEOUT_MESSAGE) {
        throw err;
      }
      throw new Error(BACKEND_UNREACHABLE_MESSAGE);
    }
    if (res.success === false) {
      const errMsg =
        (res as RefineErrorResponse).error ??
        (res as RefineErrorResponse).message ??
        BACKEND_GENERIC_ERROR_MESSAGE;
      throw new Error(errMsg);
    }
    if (typeof (res as RefineSuccessResponse).refined_text !== "string") {
      throw new Error(BACKEND_GENERIC_ERROR_MESSAGE);
    }
    return res as RefineSuccessResponse;
  }
}

/**
 * Backend expects mode to be one of VALID_MODES (refinement_modes.py).
 * Map extension tone IDs to a valid backend mode for request validation.
 */
const EXTENSION_TONE_TO_BACKEND_MODE: Record<string, RefineMode> = {
  professional: "professional",
  polite: "polite",
  concise: "concise",
  grammar: "grammar_only",
  stronger: "assertive",
  friendly: "clarity"
};

const DEFAULT_BACKEND_MODE: RefineMode = "clarity";

/** Build default refine payload from text and tone. */
export function buildRefinePayload(
  text: string,
  toneId: string
): RefineRequestPayload {
  const mode = EXTENSION_TONE_TO_BACKEND_MODE[toneId] ?? DEFAULT_BACKEND_MODE;
  return {
    text,
    tone: [toneId],
    mode,
    preserve_entities: DEFAULT_PRESERVE_ENTITIES,
    preserve_urls: DEFAULT_PRESERVE_URLS,
    preserve_ids: DEFAULT_PRESERVE_IDS,
    length: DEFAULT_LENGTH_OPTION
  };
}
