import React, { createContext, useContext, useState, useCallback } from "react";
import type {
  RefinementTone,
  RefineRequest,
  RefineResultMetadata,
  LengthOption,
  OutputFormatOption,
  ExactnessOption,
} from "../types/refine";
import { refineText } from "../services/api";
import { normalizeWhitespace } from "../utils/format";
import {
  PRESETS,
  type PresetKey,
  type RefinementPreset,
} from "../constants/presets";
import type { RefinementModeKey } from "../config/refinementModes";

interface RefineState {
  input: string;
  output: string;
  mode: RefinementModeKey;
  exactness: ExactnessOption;
  lastMetadata: RefineResultMetadata | null;
  tones: RefinementTone[];
  length: LengthOption;
  outputFormat: OutputFormatOption;
  preserveMeaning: boolean;
  preserveKeywords: boolean;
  preserveNamesAndIds: boolean;
  keepTechnicalTerms: boolean;
  customInstruction: string;
  preset: PresetKey;
  isLoading: boolean;
  error: string | null;
}

interface RefineContextValue extends RefineState {
  setInput: (value: string) => void;
  setMode: (mode: RefinementModeKey) => void;
  setExactness: (value: ExactnessOption) => void;
  toggleTone: (tone: RefinementTone) => void;
  setLength: (length: LengthOption) => void;
  setOutputFormat: (format: OutputFormatOption) => void;
  setPreserveMeaning: (value: boolean) => void;
  setPreserveKeywords: (value: boolean) => void;
  setPreserveNamesAndIds: (value: boolean) => void;
  setKeepTechnicalTerms: (value: boolean) => void;
  setCustomInstruction: (value: string) => void;
  setPreset: (preset: PresetKey) => void;
  applyPresetDefaults: () => void;
  clearControls: () => void;
  runRefinement: () => Promise<void>;
  useOutput: () => void;
}

const RefineContext = createContext<RefineContextValue | undefined>(undefined);

export const RefineProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const defaultPreset: RefinementPreset = PRESETS.find(
    (p) => p.key === "polite_internal",
  )!;

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<RefinementModeKey>("clarity");
  const [exactness, setExactness] = useState<ExactnessOption>("balanced");
  const [lastMetadata, setLastMetadata] = useState<RefineResultMetadata | null>(null);
  const [tones, setTones] = useState<RefinementTone[]>(
    defaultPreset.tone as RefinementTone[],
  );
  const [length, setLength] = useState<LengthOption>(defaultPreset.length);
  const [outputFormat, setOutputFormat] = useState<OutputFormatOption>(
    defaultPreset.output_format,
  );
  const [preserveMeaning, setPreserveMeaning] = useState<boolean>(
    defaultPreset.preserve_meaning,
  );
  const [preserveKeywords, setPreserveKeywords] = useState<boolean>(
    defaultPreset.preserve_keywords,
  );
  const [preserveNamesAndIds, setPreserveNamesAndIds] = useState<boolean>(
    defaultPreset.preserve_names_and_ids,
  );
  const [keepTechnicalTerms, setKeepTechnicalTerms] = useState<boolean>(
    defaultPreset.keep_technical_terms,
  );
  const [customInstruction, setCustomInstruction] = useState<string>(
    defaultPreset.custom_instruction,
  );
  const [preset, setPreset] = useState<PresetKey>(defaultPreset.key);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTone = useCallback(
    (tone: RefinementTone) => {
      setTones((current) =>
        current.includes(tone)
          ? (current.filter((t) => t !== tone) as RefinementTone[])
          : [...current, tone],
      );
    },
    [setTones],
  );

  const applyPresetDefaults = useCallback(() => {
    const active = PRESETS.find((p) => p.key === preset);
    if (!active) return;
    setTones(active.tone as RefinementTone[]);
    setLength(active.length);
    setOutputFormat(active.output_format);
    setPreserveMeaning(active.preserve_meaning);
    setPreserveKeywords(active.preserve_keywords);
    setPreserveNamesAndIds(active.preserve_names_and_ids);
    setKeepTechnicalTerms(active.keep_technical_terms);
    setCustomInstruction(active.custom_instruction);
  }, [preset]);

  const clearControls = useCallback(() => {
    setTones([]);
    setLength("same");
    setOutputFormat("paragraph");
    setPreserveMeaning(true);
    setPreserveKeywords(true);
    setPreserveNamesAndIds(true);
    setKeepTechnicalTerms(true);
    setCustomInstruction("");
    setPreset("custom");
  }, []);

  const runRefinement = useCallback(async () => {
    const text = normalizeWhitespace(input);
    if (!text) return;

    setIsLoading(true);
    setError(null);
    setLastMetadata(null);

    try {
      const payload: RefineRequest = {
        input_text: text,
        mode,
        exactness,
        custom_instruction: mode === "custom" ? customInstruction || undefined : (customInstruction || undefined),
        tone: [],
        length,
        output_format: outputFormat,
        preserve_meaning: preserveMeaning,
        preserve_keywords: preserveKeywords,
        preserve_names_and_ids: preserveNamesAndIds,
        keep_technical_terms: keepTechnicalTerms,
        preset: undefined,
      };

      const response = await refineText(payload);
      setOutput(response.refined_text);
      setLastMetadata({
        mode: response.mode ?? mode,
        validation_passed: response.validation_passed,
        entities_preserved: response.entities_preserved,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [input, mode, exactness, customInstruction, preserveMeaning, preserveKeywords, preserveNamesAndIds, keepTechnicalTerms, length, outputFormat]);

  const useOutput = useCallback(() => {
    if (output) setInput(output);
  }, [output]);

  return (
    <RefineContext.Provider
      value={{
        input,
        output,
        mode,
        exactness,
        lastMetadata,
        tones,
        length,
        outputFormat,
        preserveMeaning,
        preserveKeywords,
        preserveNamesAndIds,
        keepTechnicalTerms,
        customInstruction,
        preset,
        isLoading,
        error,
        setInput,
        setMode,
        setExactness,
        toggleTone,
        setLength,
        setOutputFormat,
        setPreserveMeaning,
        setPreserveKeywords,
        setPreserveNamesAndIds,
        setKeepTechnicalTerms,
        setCustomInstruction,
        setPreset,
        applyPresetDefaults,
        clearControls,
        runRefinement,
        useOutput,
      }}
    >
      {children}
    </RefineContext.Provider>
  );
};

export const useRefineStore = (): RefineContextValue => {
  const ctx = useContext(RefineContext);
  if (!ctx) {
    throw new Error("useRefineStore must be used within RefineProvider");
  }
  return ctx;
};
