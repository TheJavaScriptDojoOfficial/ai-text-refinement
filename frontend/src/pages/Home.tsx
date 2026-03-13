import React from 'react';
import { useRefineStore } from './storeProxy';
import TextInput from '../components/TextInput';
import RefinePanel from '../components/refiner/RefinePanel';
import ResultPanel from '../components/refiner/ResultPanel';
import { Card } from '../components/Common';

const Home: React.FC = () => {
  const {
    input,
    output,
    mode,
    exactness,
    customInstruction,
    lastMetadata,
    isLoading,
    error,
    setInput,
    setMode,
    setExactness,
    setCustomInstruction,
    runRefinement,
    useOutput,
  } = useRefineStore();

  const canRefine =
    input.trim().length > 0 &&
    (mode !== 'custom' || customInstruction.trim().length > 0);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-8">
      <header className="mb-2 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          AI Text Refinement
        </h1>
        <p className="max-w-2xl text-sm text-slate-400">
          Paste a message, choose a refinement mode, and let your local model rewrite it.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <TextInput value={input} onChange={setInput} />
        </Card>
        <Card>
          <ResultPanel
            value={output}
            isLoading={isLoading}
            error={error}
            metadata={lastMetadata}
            onUseOutput={useOutput}
          />
        </Card>
      </div>

      <RefinePanel
        mode={mode}
        exactness={exactness}
        customInstruction={customInstruction}
        onModeChange={setMode}
        onExactnessChange={setExactness}
        onCustomInstructionChange={setCustomInstruction}
        onRefine={runRefinement}
        disabled={isLoading || !canRefine}
      />
    </main>
  );
};

export default Home;
