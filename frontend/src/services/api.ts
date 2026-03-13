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

  if (!response.ok) {
    throw new Error('Failed to refine text');
  }

  return (await response.json()) as RefineResponse;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

