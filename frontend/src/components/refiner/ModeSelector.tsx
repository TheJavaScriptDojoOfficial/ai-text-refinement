import React from 'react';
import { refinementModes, type RefinementModeKey } from '../../config/refinementModes';

interface ModeSelectorProps {
  value: RefinementModeKey;
  onChange: (mode: RefinementModeKey) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-slate-300">Mode</label>
      <div className="flex flex-wrap gap-2">
        {refinementModes.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => onChange(m.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              value === m.key
                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-100'
                : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500'
            }`}
          >
            {m.shortLabel}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModeSelector;
