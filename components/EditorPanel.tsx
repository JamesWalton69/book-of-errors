
import React from 'react';

interface EditorPanelProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  onRun: () => void;
  isRunning: boolean;
}

const RunIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
);


export const EditorPanel: React.FC<EditorPanelProps> = ({ code, onCodeChange, onRun, isRunning }) => {
  return (
    <div className="flex-1 flex flex-col relative bg-primary">
       <div className="flex items-center justify-between p-2 bg-secondary border-b border-gray-700">
            <span className="text-sm text-text-secondary px-2">main.py</span>
            <button
                onClick={onRun}
                disabled={isRunning}
                className="flex items-center gap-2 bg-green-accent text-primary font-bold py-1.5 px-4 rounded-md hover:bg-opacity-90 transition-all disabled:bg-gray-500 disabled:cursor-not-allowed"
                title="Run Code (Ctrl+Enter)"
            >
                <RunIcon />
                {isRunning ? 'Running...' : 'Run'}
            </button>
        </div>
      <textarea
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        className="flex-1 p-4 bg-primary text-text-primary outline-none resize-none font-mono text-base leading-relaxed tracking-wide w-full h-full"
        placeholder="Write your Python code here..."
        spellCheck="false"
      />
    </div>
  );
};
