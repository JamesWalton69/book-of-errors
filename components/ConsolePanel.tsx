
import React from 'react';

interface ConsolePanelProps {
  output: string;
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({ output }) => {
  return (
    <div className="flex flex-col w-full md:w-1/2 p-4 bg-primary border-t-2 md:border-t-0 md:border-l-2 border-secondary h-1/2 md:h-auto">
      <h2 className="text-lg font-semibold text-text-secondary mb-2">Console</h2>
      <pre className="flex-1 w-full bg-secondary p-4 rounded-md font-mono text-text-primary whitespace-pre-wrap break-words overflow-auto">
        <code>{output}</code>
      </pre>
    </div>
  );
};
