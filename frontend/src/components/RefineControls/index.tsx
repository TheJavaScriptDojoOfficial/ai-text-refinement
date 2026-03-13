import React from 'react';
import type { RefinementTone } from '../../types/refine';

interface RefineControlsProps {
  tone: RefinementTone;
  onToneChange: (tone: RefinementTone) => void;
  onRefine: () => void;
  disabled?: boolean;
}

const toneOptions: { label: string; value: RefinementTone; description: string }[] = [
  { label: 'Polite', value: 'polite', description: 'Softens language and adds courtesy.' },
  { label: 'Concise', value: 'concise', description: 'Removes fluff while keeping intent.' },
  { label: 'Professional', value: 'professional', description: 'Formal and workplace-appropriate.' }
];

const RefineControls: React.FC<RefineControlsProps> = ({
  tone,
  onToneChange,
  onRefine,
  disabled
}) => {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <span className="text-sm font-medium text-slate-200">Refinement style</span>
      <div className="grid gap-2 sm:grid-cols-3">
        {toneOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onToneChange(option.value)}
            className={`flex flex-col items-start rounded-md border px-3 py-2 text-left text-sm transition ${
              tone === option.value
                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-100'
                : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500'
            }`}
          >
            <span className="font-semibold">{option.label}</span>
            <span className="mt-1 text-xs text-slate-400">{option.description}</span>
          </button>
        ))}
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
    </div>
  );
};

export default RefineControls;

