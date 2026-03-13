import React from 'react';
import ModeSelector from './ModeSelector';
import ExactnessSelector from './ExactnessSelector';
import CustomInstructionBox from './CustomInstructionBox';
import {
  refinementModes,
  oneClickPresets,
  type RefinementModeKey,
  type ExactnessOption,
} from '../../config/refinementModes';

interface RefinePanelProps {
  mode: RefinementModeKey;
  exactness: ExactnessOption;
  customInstruction: string;
  onModeChange: (mode: RefinementModeKey) => void;
  onExactnessChange: (value: ExactnessOption) => void;
  onCustomInstructionChange: (value: string) => void;
  onRefine: () => void;
  disabled?: boolean;
}

const RefinePanel: React.FC<RefinePanelProps> = ({
  mode,
  exactness,
  customInstruction,
  onModeChange,
  onExactnessChange,
  onCustomInstructionChange,
  onRefine,
  disabled,
}) => {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-200">Refinement controls</span>
        <p className="text-xs text-slate-400">
          Choose a mode and optional exactness. The model will rewrite your text accordingly.
        </p>
      </div>

      <ModeSelector value={mode} onChange={onModeChange} />

      <div className="flex flex-wrap items-center gap-4">
        <ExactnessSelector value={exactness} onChange={onExactnessChange} />
      </div>

      {mode === 'custom' && (
        <CustomInstructionBox
          value={customInstruction}
          onChange={onCustomInstructionChange}
          placeholder="e.g. Make it suitable for Teams internal communication and keep it respectful."
        />
      )}

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-slate-300">One-click</span>
        <div className="flex flex-wrap gap-2">
          {oneClickPresets.map((p) => (
            <button
              key={p.mode}
              type="button"
              onClick={() => onModeChange(p.mode)}
              className={`rounded-full border px-3 py-1 text-xs ${
                mode === p.mode
                  ? 'border-indigo-500 bg-indigo-500/20 text-indigo-100'
                  : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onRefine}
          disabled={disabled}
          className="inline-flex items-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Refine
        </button>
      </div>
    </section>
  );
};

export default RefinePanel;
