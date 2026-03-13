export type RefinementTone =
  | 'professional'
  | 'polite'
  | 'concise'
  | 'diplomatic'
  | 'friendly'
  | 'assertive';

export type LengthOption = 'shorter' | 'same' | 'longer';

export type OutputFormatOption = 'paragraph' | 'bullet_points';

export type ExactnessOption = 'strict' | 'balanced' | 'loose';

export interface RefineRequest {
  input_text: string;
  /** Mode-based flow: set mode and omit tone/preset so backend uses mode prompt. */
  mode?: string;
  exactness?: ExactnessOption;
  custom_instruction?: string;
  tone: string[];
  length: LengthOption;
  output_format: OutputFormatOption;
  preserve_meaning: boolean;
  preserve_keywords: boolean;
  preserve_names_and_ids: boolean;
  keep_technical_terms: boolean;
  preset?: string;
}

export interface RefineResponse {
  refined_text: string;
  mode?: string;
  entities_preserved: boolean;
  validation_passed: boolean;
}

export interface RefineResultMetadata {
  mode: string | null;
  validation_passed: boolean;
  entities_preserved: boolean;
}

