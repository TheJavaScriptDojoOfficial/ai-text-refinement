/**
 * Backend API client for the local refinement service.
 * Contract: GET /api/health, POST /api/refine.
 * Health results are cached for HEALTH_CHECK_CACHE_TTL_MS.
 */
import type {
  HealthResponse,
  HealthCheckResult,
  HealthCheckTriggerSource,
  RefineRequestPayload,
  RefineSuccessResponse,
  RefineErrorResponse,
  RefineMode,
  RefineLengthOption
} from "../shared/types";
import {
  HEALTH_ENDPOINT_PATH,
  REFINE_ENDPOINT_PATH,
  HEALTH_CHECK_CACHE_TTL_MS,
  BACKEND_UNREACHABLE_MESSAGE,
  BACKEND_TIMEOUT_MESSAGE,
  BACKEND_NOT_READY_MESSAGE,
  INVALID_BACKEND_RESPONSE_MESSAGE,
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

const now = (): number => Date.now();

function normalizeHealthCheckResult(
  status: HealthCheckResult["status"],
  ok: boolean,
  opts: {
    modelReady?: boolean;
    model?: string;
    message?: string;
  } = {}
): HealthCheckResult {
  return {
    status,
    ok,
    modelReady: opts.modelReady,
    model: opts.model,
    message: opts.message,
    checkedAt: now()
  };
}

async function fetchHealthRaw(
  url: string,
  timeoutMs: number
): Promise<HealthCheckResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { Accept: "application/json" }
    });
    clearTimeout(timeoutId);
    const text = await res.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      return normalizeHealthCheckResult("error", false, {
        message: INVALID_BACKEND_RESPONSE_MESSAGE
      });
    }
    const body = data as HealthResponse | null;
    if (!body || typeof body !== "object") {
      return normalizeHealthCheckResult("error", false, {
        message: INVALID_BACKEND_RESPONSE_MESSAGE
      });
    }
    const ok = Boolean(body.ok);
    const modelReady = body.model_ready;
    const model = typeof body.model === "string" ? body.model : undefined;
    if (ok && modelReady === false) {
      return normalizeHealthCheckResult("not-ready", false, {
        modelReady: false,
        model,
        message: BACKEND_NOT_READY_MESSAGE
      });
    }
    if (ok) {
      return normalizeHealthCheckResult("healthy", true, {
        modelReady: modelReady === true,
        model
      });
    }
    return normalizeHealthCheckResult("error", false, {
      message: (body as { message?: string }).message ?? BACKEND_NOT_READY_MESSAGE
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      return normalizeHealthCheckResult("timeout", false, {
        message: BACKEND_TIMEOUT_MESSAGE
      });
    }
    return normalizeHealthCheckResult("unreachable", false, {
      message: BACKEND_UNREACHABLE_MESSAGE
    });
  }
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
      throw new Error(INVALID_BACKEND_RESPONSE_MESSAGE);
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
        err.message === BACKEND_GENERIC_ERROR_MESSAGE ||
        err.message === INVALID_BACKEND_RESPONSE_MESSAGE
      ) {
        throw err;
      }
      throw new Error(BACKEND_UNREACHABLE_MESSAGE);
    }
    throw new Error(BACKEND_GENERIC_ERROR_MESSAGE);
  }
}

export class LocalRefinerApiClient {
  private healthCache: { result: HealthCheckResult; cachedAt: number } | null =
    null;

  async checkHealth(
    force = false,
    _source?: HealthCheckTriggerSource
  ): Promise<HealthCheckResult> {
    const cached = this.healthCache;
    if (
      !force &&
      cached &&
      now() - cached.cachedAt < HEALTH_CHECK_CACHE_TTL_MS
    ) {
      return cached.result;
    }
    const { backendUrl, requestTimeoutMs } = await getBackendConfig();
    const url = buildUrl(backendUrl, HEALTH_ENDPOINT_PATH);
    const result = await fetchHealthRaw(url, requestTimeoutMs);
    this.healthCache = { result, cachedAt: now() };
    return result;
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

export interface BuildRefinePayloadOverrides {
  preserve_entities?: boolean;
  preserve_urls?: boolean;
  preserve_ids?: boolean;
  length?: RefineLengthOption;
}

/** Build refine payload from text and tone; optional overrides from settings. */
export function buildRefinePayload(
  text: string,
  toneId: string,
  overrides?: BuildRefinePayloadOverrides
): RefineRequestPayload {
  const mode = EXTENSION_TONE_TO_BACKEND_MODE[toneId] ?? DEFAULT_BACKEND_MODE;
  return {
    text,
    tone: [toneId],
    mode,
    preserve_entities: overrides?.preserve_entities ?? DEFAULT_PRESERVE_ENTITIES,
    preserve_urls: overrides?.preserve_urls ?? DEFAULT_PRESERVE_URLS,
    preserve_ids: overrides?.preserve_ids ?? DEFAULT_PRESERVE_IDS,
    length: overrides?.length ?? DEFAULT_LENGTH_OPTION
  };
}
