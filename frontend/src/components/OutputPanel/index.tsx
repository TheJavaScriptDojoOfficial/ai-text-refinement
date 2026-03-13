import React from 'react';

interface OutputPanelProps {
  value: string;
  isLoading?: boolean;
  error?: string | null;
}

const OutputPanel: React.FC<OutputPanelProps> = ({ value, isLoading, error }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-200">Refined output</label>
        {isLoading && (
          <span className="text-xs text-indigo-300">Refining with local model…</span>
        )}
      </div>
      <div className="min-h-[160px] rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100">
        {error ? (
          <span className="text-sm text-rose-400">{error}</span>
        ) : value ? (
          <p className="whitespace-pre-wrap">{value}</p>
        ) : (
          <span className="text-sm text-slate-500">
            Your refined message will appear here.
          </span>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;

