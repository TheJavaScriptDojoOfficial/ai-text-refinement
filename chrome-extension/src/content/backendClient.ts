import { getBackendUrl } from "../shared/storage";

export interface RefinementRequest {
  text: string;
}

export interface RefinementResponse {
  refinedText: string;
}

export async function refineText(
  _request: RefinementRequest
): Promise<RefinementResponse> {
  const backendUrl = await getBackendUrl();

  // Placeholder stub: real request to the Python backend will be implemented later.
  console.debug("Would send refinement request to backend at:", backendUrl);

  return {
    refinedText: _request.text
  };
}

