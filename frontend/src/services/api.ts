import type { RefineRequest, RefineResponse } from '../types/refine';

const API_BASE = '/api';

export async function refineText(payload: RefineRequest): Promise<RefineResponse> {
  const response = await fetch(`${API_BASE}/refine`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = (await response.json()) as RefineResponse | { detail?: string };

  if (!response.ok) {
    const message =
      (data as any).error || (data as any).detail || 'Failed to refine text with backend';
    throw new Error(message);
  }

  return data as RefineResponse;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

