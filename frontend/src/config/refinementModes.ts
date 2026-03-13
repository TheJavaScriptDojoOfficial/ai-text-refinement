/**
 * Refinement mode config for UI. Mirrors backend mode keys and labels.
 */

export type RefinementModeKey =
  | 'grammar_only'
  | 'clarity'
  | 'concise'
  | 'professional'
  | 'polite'
  | 'assertive'
  | 'bullet_points'
  | 'teams_message'
  | 'email'
  | 'jira_comment'
  | 'custom';

export interface RefinementModeOption {
  key: RefinementModeKey;
  label: string;
  shortLabel: string;
}

export const refinementModes: RefinementModeOption[] = [
  { key: 'grammar_only', label: 'Fix Grammar Only', shortLabel: 'Grammar' },
  { key: 'clarity', label: 'Improve Clarity', shortLabel: 'Clarity' },
  { key: 'concise', label: 'Make Concise', shortLabel: 'Concise' },
  { key: 'professional', label: 'Make Professional', shortLabel: 'Professional' },
  { key: 'polite', label: 'Make Polite', shortLabel: 'Polite' },
  { key: 'assertive', label: 'Make Assertive', shortLabel: 'Assertive' },
  { key: 'bullet_points', label: 'Convert to Bullet Points', shortLabel: 'Bullet Points' },
  { key: 'teams_message', label: 'Rephrase for Teams Message', shortLabel: 'Teams' },
  { key: 'email', label: 'Rephrase for Email', shortLabel: 'Email' },
  { key: 'jira_comment', label: 'Rephrase for Jira/Comment', shortLabel: 'Jira' },
  { key: 'custom', label: 'Custom Instruction', shortLabel: 'Custom' },
];

/** One-click preset: label and mode key (no auto-run). */
export const oneClickPresets: { label: string; mode: RefinementModeKey }[] = [
  { label: 'Fix Grammar', mode: 'grammar_only' },
  { label: 'Make Professional', mode: 'professional' },
  { label: 'Make Polite', mode: 'polite' },
  { label: 'Shorten', mode: 'concise' },
  { label: 'Teams Style', mode: 'teams_message' },
  { label: 'Email Style', mode: 'email' },
  { label: 'Jira Update', mode: 'jira_comment' },
];

export type ExactnessOption = 'strict' | 'balanced' | 'loose';

export const exactnessOptions: { value: ExactnessOption; label: string }[] = [
  { value: 'strict', label: 'Strict' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'loose', label: 'Loose' },
];
