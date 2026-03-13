export type RefinementTone =
  | 'professional'
  | 'polite'
  | 'concise'
  | 'diplomatic'
  | 'friendly'
  | 'assertive';

export type LengthOption = 'shorter' | 'same' | 'longer';

export type OutputFormatOption = 'paragraph' | 'bullet_points';

export interface RefineRequest {
  input_text: string;
  tone: string[];
  length: LengthOption;
  output_format: OutputFormatOption;
  preserve_meaning: boolean;
  preserve_keywords: boolean;
  preserve_names_and_ids: boolean;
  keep_technical_terms: boolean;
  custom_instruction?: string;
  preset?: string;
}

export interface RefineResponse {
  refined_text: string;
  entities_preserved: boolean;
  validation_passed: boolean;
}

