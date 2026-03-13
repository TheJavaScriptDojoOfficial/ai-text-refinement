import React, { createContext, useContext, useState, useCallback } from "react";
import type {
  RefinementTone,
  RefineRequest,
  LengthOption,
  OutputFormatOption,
} from "../types/refine";
import { refineText } from "../services/api";
import { normalizeWhitespace } from "../utils/format";
import {
  PRESETS,
  type PresetKey,
  type RefinementPreset,
} from "../constants/presets";

interface RefineState {
  input: string;
  output: string;
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

    try {
      const payload: RefineRequest = {
        input_text: text,
        tone: tones.length ? tones : ["professional"],
        length,
        output_format: outputFormat,
        preserve_meaning: true,
        preserve_keywords: preserveKeywords,
        preserve_names_and_ids: preserveNamesAndIds,
        keep_technical_terms: keepTechnicalTerms,
        custom_instruction: customInstruction || undefined,
        preset: preset === "custom" ? undefined : preset,
      };

      const response = await refineText(payload);
      setOutput(response.output_text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [input, tones]);

  return (
    <RefineContext.Provider
      value={{
        input,
        output,
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
