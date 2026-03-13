export type RefinementTone = 'polite' | 'concise' | 'professional';

export interface RefineRequest {
  input_text: string;
  tone?: string[];
  preserve_meaning: boolean;
  preserve_keywords: boolean;
  output_format: 'paragraph' | 'bullet_points';
  custom_instruction?: string;
}

export interface RefineResponse {
  output_text: string;
  model: string;
  success: boolean;
  error?: string;
}

