
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { EditorPanel } from './components/EditorPanel';
import { ConsolePanel } from './components/ConsolePanel';
import { SaveModal } from './components/SaveModal';
import { LoadModal } from './components/LoadModal';
import { executePythonCode } from './services/geminiService';

const App: React.FC = () => {
  const [code, setCode] = useState<string>('print("Hello, PyCode Cloud!")');
  const [output, setOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState<boolean>(false);
  const [savedCodeId, setSavedCodeId] = useState<string | null>(null);

  const handleRun = useCallback(async () => {
    setIsLoading(true);
    setOutput('Executing code...');
    try {
      const result = await executePythonCode(code);
      setOutput(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setOutput(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [code]);

  const handleSave = useCallback(() => {
    if (!code.trim()) {
      setOutput('Cannot save empty code.');
      return;
    }
    const id = `pycode-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
    localStorage.setItem(id, code);
    setSavedCodeId(id);
    setIsSaveModalOpen(true);
  }, [code]);

  const handleLoad = useCallback((id: string) => {
    if (!id.trim()) {
      setOutput('Please enter a valid save ID.');
      return;
    }
    const savedCode = localStorage.getItem(id);
    if (savedCode) {
      setCode(savedCode);
      setOutput(`Successfully loaded code from ID: ${id}`);
    } else {
      setOutput(`Error: No code found for ID: ${id}`);
    }
    setIsLoadModalOpen(false);
  }, []);

  const handleClear = useCallback(() => {
    setCode('');
    setOutput('');
  }, []);

  return (
    <div className="flex flex-col h-screen bg-primary font-sans">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <div className="flex flex-col w-full md:flex-row">
          <EditorPanel
            code={code}
            setCode={setCode}
            onRun={handleRun}
            onSave={handleSave}
            onLoad={() => setIsLoadModalOpen(true)}
            onClear={handleClear}
            isLoading={isLoading}
          />
          <ConsolePanel output={output} />
        </div>
      </main>
      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        codeId={savedCodeId}
      />
      <LoadModal
        isOpen={isLoadModalOpen}
        onClose={() => setIsLoadModalOpen(false)}
        onLoad={handleLoad}
      />
    </div>
  );
};

export default App;
