
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { FileExplorer } from './components/FileExplorer';
import { EditorPanel } from './components/EditorPanel';
import { Output } from './components/Output';
import { runPythonCode } from './services/geminiService';
import type { SavedFile } from './types';
import { initialCode } from './constants';

const App: React.FC = () => {
  const [files, setFiles] = useState<SavedFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [code, setCode] = useState<string>(initialCode);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedFilesRaw = localStorage.getItem('pyforge_files');
      if (savedFilesRaw) {
        const savedFiles = JSON.parse(savedFilesRaw);
        if (Array.isArray(savedFiles) && savedFiles.length > 0) {
          setFiles(savedFiles);
          const lastActiveId = localStorage.getItem('pyforge_active_id');
          const fileToActivate = savedFiles.find(f => f.id === lastActiveId) || savedFiles[0];
          setActiveFileId(fileToActivate.id);
          setCode(fileToActivate.code);
        } else {
          handleNewFile();
        }
      } else {
        handleNewFile();
      }
    } catch (error) {
      console.error("Failed to load files from localStorage:", error);
      handleNewFile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setOutput('');
    try {
      const result = await runPythonCode(code);
      setOutput(result);
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRunning(false);
    }
  }, [code]);

  const updateActiveFileCode = (newCode: string) => {
    setCode(newCode);
    if (activeFileId) {
      const updatedFiles = files.map(file =>
        file.id === activeFileId ? { ...file, code: newCode } : file
      );
      setFiles(updatedFiles);
      localStorage.setItem('pyforge_files', JSON.stringify(updatedFiles));
    }
  };

  const handleSelectFile = (id: string) => {
    const file = files.find(f => f.id === id);
    if (file) {
      setActiveFileId(id);
      setCode(file.code);
      localStorage.setItem('pyforge_active_id', id);
    }
  };

  const handleNewFile = () => {
    const newFile: SavedFile = {
      id: `file_${Date.now()}`,
      name: `new_script_${files.length + 1}.py`,
      code: '# Start your new Python script here!\nprint("Hello, PyForge!")',
    };
    const updatedFiles = [...files, newFile];
    setFiles(updatedFiles);
    setActiveFileId(newFile.id);
    setCode(newFile.code);
    localStorage.setItem('pyforge_files', JSON.stringify(updatedFiles));
    localStorage.setItem('pyforge_active_id', newFile.id);
  };
  
  const handleDeleteFile = (id: string) => {
    if (files.length <= 1) {
        alert("Cannot delete the last file.");
        return;
    }
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    localStorage.setItem('pyforge_files', JSON.stringify(updatedFiles));

    if (activeFileId === id) {
        const newActiveFile = updatedFiles[0];
        if (newActiveFile) {
            handleSelectFile(newActiveFile.id);
        } else {
            setActiveFileId(null);
            setCode('');
        }
    }
  };

  const handleRenameFile = (id: string, newName: string) => {
    const updatedFiles = files.map(file =>
      file.id === id ? { ...file, name: newName } : file
    );
    setFiles(updatedFiles);
    localStorage.setItem('pyforge_files', JSON.stringify(updatedFiles));
  };


  return (
    <div className="flex flex-col h-screen bg-primary font-mono">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <FileExplorer
          files={files}
          activeFileId={activeFileId}
          onSelectFile={handleSelectFile}
          onNewFile={handleNewFile}
          onDeleteFile={handleDeleteFile}
          onRenameFile={handleRenameFile}
        />
        <div className="flex flex-1 flex-col w-3/4">
          <EditorPanel
            code={code}
            onCodeChange={updateActiveFileCode}
            onRun={handleRun}
            isRunning={isRunning}
          />
          <Output output={output} isRunning={isRunning} />
        </div>
      </main>
    </div>
  );
};

export default App;
