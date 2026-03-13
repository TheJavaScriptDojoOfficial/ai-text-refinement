import React from 'react';
import { useRefineStore } from './storeProxy';
import TextInput from '../components/TextInput';
import RefineControls from '../components/RefineControls';
import OutputPanel from '../components/OutputPanel';
import { Card } from '../components/Common';

const Home: React.FC = () => {
  const {
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
    runRefinement
  } = useRefineStore();

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-8">
      <header className="mb-2 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          AI Text Refinement
        </h1>
        <p className="max-w-2xl text-sm text-slate-400">
          Paste a message, choose a style, and let your local model rewrite it to be clearer,
          more polite, or more professional.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <TextInput value={input} onChange={setInput} />
        </Card>
        <Card>
          <OutputPanel value={output} isLoading={isLoading} error={error} />
        </Card>
      </div>

      <RefineControls
        tones={tones}
        length={length}
        outputFormat={outputFormat}
        preserveMeaning={preserveMeaning}
        preserveKeywords={preserveKeywords}
        preserveNamesAndIds={preserveNamesAndIds}
        keepTechnicalTerms={keepTechnicalTerms}
        customInstruction={customInstruction}
        preset={preset}
        onToggleTone={toggleTone}
        onLengthChange={setLength}
        onOutputFormatChange={setOutputFormat}
        onPreserveMeaningChange={setPreserveMeaning}
        onPreserveKeywordsChange={setPreserveKeywords}
        onPreserveNamesAndIdsChange={setPreserveNamesAndIds}
        onKeepTechnicalTermsChange={setKeepTechnicalTerms}
        onCustomInstructionChange={setCustomInstruction}
        onPresetChange={setPreset}
        onApplyPresetDefaults={applyPresetDefaults}
        onClearControls={clearControls}
        onRefine={runRefinement}
        disabled={isLoading || !input.trim()}
      />
    </main>
  );
};

export default Home;

