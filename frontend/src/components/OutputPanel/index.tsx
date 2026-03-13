import React, { useState } from 'react';

interface OutputPanelProps {
  value: string;
  isLoading?: boolean;
  error?: string | null;
}

const OutputPanel: React.FC<OutputPanelProps> = ({ value, isLoading, error }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-200">Refined output</label>
        <div className="flex items-center gap-3">
          {isLoading && (
            <span className="text-xs text-indigo-300">Refining with local model…</span>
          )}
          <button
            type="button"
            onClick={handleCopy}
            disabled={!value}
            className="inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] font-medium text-slate-200 hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="text-xs" aria-hidden="true">
              ⧉
            </span>
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
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

