export type LengthOption = 'shorter' | 'same' | 'longer';

export type OutputFormatOption = 'paragraph' | 'bullet_points';

export type PresetKey =
  | 'polite_internal'
  | 'client_friendly'
  | 'teams_status'
  | 'manager_update'
  | 'diplomatic_escalation'
  | 'custom';

export interface RefinementPreset {
  key: PresetKey;
  label: string;
  tone: string[];
  length: LengthOption;
  output_format: OutputFormatOption;
  preserve_meaning: boolean;
  preserve_keywords: boolean;
  preserve_names_and_ids: boolean;
  keep_technical_terms: boolean;
  custom_instruction: string;
}

export const PRESETS: RefinementPreset[] = [
  {
    key: 'polite_internal',
    label: 'Polite Internal Message',
    tone: ['professional', 'polite'],
    length: 'same',
    output_format: 'paragraph',
    preserve_meaning: true,
    preserve_keywords: true,
    preserve_names_and_ids: true,
    keep_technical_terms: true,
    custom_instruction: 'Make it suitable for internal workplace communication.'
  },
  {
    key: 'client_friendly',
    label: 'Client-Friendly Rewrite',
    tone: ['professional', 'polite', 'diplomatic'],
    length: 'same',
    output_format: 'paragraph',
    preserve_meaning: true,
    preserve_keywords: true,
    preserve_names_and_ids: true,
    keep_technical_terms: true,
    custom_instruction:
      'Make it client-safe and respectful, avoiding harsh phrasing while keeping meaning intact.'
  },
  {
    key: 'teams_status',
    label: 'Teams Status Update',
    tone: ['professional', 'concise'],
    length: 'shorter',
    output_format: 'bullet_points',
    preserve_meaning: true,
    preserve_keywords: true,
    preserve_names_and_ids: true,
    keep_technical_terms: true,
    custom_instruction:
      'Present as a clear status update with blockers and next steps if relevant.'
  },
  {
    key: 'manager_update',
    label: 'Manager Update',
    tone: ['professional', 'concise'],
    length: 'shorter',
    output_format: 'bullet_points',
    preserve_meaning: true,
    preserve_keywords: true,
    preserve_names_and_ids: true,
    keep_technical_terms: true,
    custom_instruction:
      'Make it crisp and suitable for a manager, highlighting decisions, blockers, and next steps.'
  },
  {
    key: 'diplomatic_escalation',
    label: 'Diplomatic Escalation',
    tone: ['professional', 'diplomatic', 'assertive'],
    length: 'same',
    output_format: 'paragraph',
    preserve_meaning: true,
    preserve_keywords: true,
    preserve_names_and_ids: true,
    keep_technical_terms: true,
    custom_instruction:
      'Keep it firm but respectful, avoid blame, and focus on issue clarity and action.'
  },
  {
    key: 'custom',
    label: 'Custom',
    tone: ['professional'],
    length: 'same',
    output_format: 'paragraph',
    preserve_meaning: true,
    preserve_keywords: true,
    preserve_names_and_ids: true,
    keep_technical_terms: true,
    custom_instruction:
      'Example: make it suitable for Teams internal communication and keep it respectful.'
  }
];

