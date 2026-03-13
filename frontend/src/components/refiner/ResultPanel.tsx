import React, { useState } from 'react';
import type { RefineResultMetadata } from '../../types/refine';
import { refinementModes } from '../../config/refinementModes';

interface ResultPanelProps {
  value: string;
  isLoading?: boolean;
  error?: string | null;
  metadata?: RefineResultMetadata | null;
  onUseOutput?: () => void;
}

const ResultPanel: React.FC<ResultPanelProps> = ({
  value,
  isLoading,
  error,
  metadata,
  onUseOutput,
}) => {
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

  const modeLabel =
    metadata?.mode &&
    (refinementModes.find((m) => m.key === metadata.mode)?.shortLabel ?? metadata.mode);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-200">Refined output</label>
        <div className="flex items-center gap-2">
          {isLoading && (
            <span className="text-xs text-indigo-300">Refining…</span>
          )}
          <button
            type="button"
            onClick={handleCopy}
            disabled={!value}
            className="inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] font-medium text-slate-200 hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="text-xs" aria-hidden="true">⧉</span>
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          {onUseOutput && value && (
            <button
              type="button"
              onClick={onUseOutput}
              className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] font-medium text-slate-200 hover:border-slate-500"
            >
              Use output
            </button>
          )}
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
      {metadata && (metadata.mode != null || metadata.validation_passed != null) && (
        <div className="flex flex-wrap gap-3 text-xs text-slate-400">
          {modeLabel != null && (
            <span>Mode: <span className="text-slate-300">{modeLabel}</span></span>
          )}
          <span>
            Validation: <span className="text-slate-300">{metadata.validation_passed ? 'Passed' : 'Failed'}</span>
          </span>
          <span>
            Entities: <span className="text-slate-300">{metadata.entities_preserved ? 'Preserved' : 'Not preserved'}</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default ResultPanel;
