import React from 'react';
import type {
  RefinementTone,
  LengthOption,
  OutputFormatOption
} from '../../types/refine';
import { PRESETS, type PresetKey } from '../../constants/presets';

interface RefineControlsProps {
  tones: RefinementTone[];
  length: LengthOption;
  outputFormat: OutputFormatOption;
  preserveMeaning: boolean;
  preserveKeywords: boolean;
  preserveNamesAndIds: boolean;
  keepTechnicalTerms: boolean;
  customInstruction: string;
  preset: PresetKey;
  onToggleTone: (tone: RefinementTone) => void;
  onLengthChange: (length: LengthOption) => void;
  onOutputFormatChange: (format: OutputFormatOption) => void;
  onPreserveMeaningChange: (value: boolean) => void;
  onPreserveKeywordsChange: (value: boolean) => void;
  onPreserveNamesAndIdsChange: (value: boolean) => void;
  onKeepTechnicalTermsChange: (value: boolean) => void;
  onCustomInstructionChange: (value: string) => void;
  onPresetChange: (preset: PresetKey) => void;
  onApplyPresetDefaults: () => void;
  onClearControls: () => void;
  onRefine: () => void;
  disabled?: boolean;
}

const toneOptions: { label: string; value: RefinementTone; description: string }[] = [
  { label: 'Professional', value: 'professional', description: 'Workplace-appropriate tone.' },
  { label: 'Polite', value: 'polite', description: 'Respectful and courteous language.' },
  { label: 'Concise', value: 'concise', description: 'Removes fluff while keeping intent.' },
  { label: 'Diplomatic', value: 'diplomatic', description: 'Softens friction and avoids blame.' },
  { label: 'Friendly', value: 'friendly', description: 'Warm but still workplace appropriate.' },
  { label: 'Assertive', value: 'assertive', description: 'Clear and confident without being rude.' }
];

const lengthOptions: { label: string; value: LengthOption }[] = [
  { label: 'Shorter', value: 'shorter' },
  { label: 'Same', value: 'same' },
  { label: 'Longer', value: 'longer' }
];

const formatOptions: { label: string; value: OutputFormatOption }[] = [
  { label: 'Paragraph', value: 'paragraph' },
  { label: 'Bullet points', value: 'bullet_points' }
];

const RefineControls: React.FC<RefineControlsProps> = ({
  tones,
  length,
  outputFormat,
  preserveMeaning,
  preserveKeywords,
  preserveNamesAndIds,
  keepTechnicalTerms,
  customInstruction,
  preset,
  onToggleTone,
  onLengthChange,
  onOutputFormatChange,
  onPreserveMeaningChange,
  onPreserveKeywordsChange,
  onPreserveNamesAndIdsChange,
  onKeepTechnicalTermsChange,
  onCustomInstructionChange,
  onPresetChange,
  onApplyPresetDefaults,
  onClearControls,
  onRefine,
  disabled
}) => {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-sm font-medium text-slate-200">Refinement controls</span>
          <p className="text-xs text-slate-400">
            The model will rewrite your text based only on the selected instructions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={onApplyPresetDefaults}
            className="rounded border border-slate-700 px-2 py-1 text-slate-200 hover:border-slate-500"
          >
            Reset to preset defaults
          </button>
          <button
            type="button"
            onClick={onClearControls}
            className="rounded border border-slate-700 px-2 py-1 text-slate-200 hover:border-slate-500"
          >
            Clear all controls
          </button>
        </div>
      </div>

      {/* Preset selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-slate-300">Preset</label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => onPresetChange(p.key)}
              className={`rounded-full border px-3 py-1 text-xs ${
                preset === p.key
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-100'
                  : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tone multi-select */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-slate-300">Tone</label>
        <div className="grid gap-2 sm:grid-cols-3">
          {toneOptions.map((option) => {
            const active = tones.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onToggleTone(option.value)}
                className={`flex flex-col items-start rounded-md border px-3 py-2 text-left text-xs transition ${
                  active
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-100'
                    : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500'
                }`}
              >
                <span className="font-semibold">{option.label}</span>
                <span className="mt-1 text-[0.7rem] text-slate-400">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Length and format */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-slate-300">Length</label>
          <div className="flex flex-wrap gap-2">
            {lengthOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onLengthChange(option.value)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  length === option.value
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-100'
                    : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-slate-300">Output format</label>
          <div className="flex flex-wrap gap-2">
            {formatOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onOutputFormatChange(option.value)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  outputFormat === option.value
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-100'
                    : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Constraint toggles */}
      <div className="grid gap-2 md:grid-cols-2">
        <label className="flex items-start gap-2 text-xs text-slate-200">
          <input
            type="checkbox"
            className="mt-0.5 h-3 w-3 rounded border-slate-600 bg-slate-900"
            checked={preserveMeaning}
            onChange={(e) => onPreserveMeaningChange(e.target.checked)}
          />
          <span>Preserve meaning</span>
        </label>
        <label className="flex items-start gap-2 text-xs text-slate-200">
          <input
            type="checkbox"
            className="mt-0.5 h-3 w-3 rounded border-slate-600 bg-slate-900"
            checked={preserveKeywords}
            onChange={(e) => onPreserveKeywordsChange(e.target.checked)}
          />
          <span>Preserve keywords</span>
        </label>
        <label className="flex items-start gap-2 text-xs text-slate-200">
          <input
            type="checkbox"
            className="mt-0.5 h-3 w-3 rounded border-slate-600 bg-slate-900"
            checked={preserveNamesAndIds}
            onChange={(e) => onPreserveNamesAndIdsChange(e.target.checked)}
          />
          <span>Preserve names and IDs</span>
        </label>
        <label className="flex items-start gap-2 text-xs text-slate-200">
          <input
            type="checkbox"
            className="mt-0.5 h-3 w-3 rounded border-slate-600 bg-slate-900"
            checked={keepTechnicalTerms}
            onChange={(e) => onKeepTechnicalTermsChange(e.target.checked)}
          />
          <span>Keep technical terms unchanged</span>
        </label>
      </div>

      {/* Custom instruction */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-slate-300">Custom instruction</label>
        <textarea
          className="min-h-[72px] rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-50 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
          placeholder="Example: make it suitable for Teams internal communication and keep it respectful."
          value={customInstruction}
          onChange={(e) => onCustomInstructionChange(e.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onRefine}
          disabled={disabled}
          className="inline-flex items-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-700"
        >
          Refine message
        </button>
      </div>
    </section>
  );
};

export default RefineControls;

