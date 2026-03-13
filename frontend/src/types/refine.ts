export type RefinementTone = 'polite' | 'concise' | 'professional';

export interface RefinementOptions {
  tone: RefinementTone;
}

export interface RefineRequest {
  text: string;
  options: RefinementOptions;
}

export interface RefineResponse {
  refinedText: string;
}

