import React, { createContext, useContext, useState, useCallback } from 'react';
import type { RefinementTone } from '../types/refine';
import { refineText } from '../services/api';
import { normalizeWhitespace } from '../utils/format';

interface RefineState {
  input: string;
  output: string;
  tone: RefinementTone;
  isLoading: boolean;
  error: string | null;
}

interface RefineContextValue extends RefineState {
  setInput: (value: string) => void;
  setTone: (tone: RefinementTone) => void;
  runRefinement: () => Promise<void>;
}

const RefineContext = createContext<RefineContextValue | undefined>(undefined);

export const RefineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [tone, setTone] = useState<RefinementTone>('polite');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runRefinement = useCallback(async () => {
    const text = normalizeWhitespace(input);
    if (!text) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await refineText({
        text,
        options: { tone }
      });
      setOutput(response.refinedText);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [input, tone]);

  return (
    <RefineContext.Provider
      value={{
        input,
        output,
        tone,
        isLoading,
        error,
        setInput,
        setTone,
        runRefinement
      }}
    >
      {children}
    </RefineContext.Provider>
  );
};

export const useRefineStore = (): RefineContextValue => {
  const ctx = useContext(RefineContext);
  if (!ctx) {
    throw new Error('useRefineStore must be used within RefineProvider');
  }
  return ctx;
};

