import React from 'react';
import { exactnessOptions, type ExactnessOption } from '../../config/refinementModes';

interface ExactnessSelectorProps {
  value: ExactnessOption;
  onChange: (value: ExactnessOption) => void;
}

const ExactnessSelector: React.FC<ExactnessSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-slate-300">Exactness</label>
      <div className="flex flex-wrap gap-2">
        {exactnessOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-full border px-2.5 py-1 text-xs ${
              value === opt.value
                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-100'
                : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExactnessSelector;
