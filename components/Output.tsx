
import React from 'react';

interface OutputProps {
  output: string;
  isRunning: boolean;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        <p className="ml-4 text-text-secondary">Executing with Gemini...</p>
    </div>
);

export const Output: React.FC<OutputProps> = ({ output, isRunning }) => {
  const isError = output.toLowerCase().includes('error');
  return (
    <div className="h-1/3 flex flex-col bg-secondary border-t border-gray-700">
      <h3 className="text-lg font-semibold p-3 border-b border-gray-700 bg-secondary flex-shrink-0 text-text-secondary">
        Console
      </h3>
      <div className="flex-1 p-4 overflow-y-auto">
        {isRunning ? (
          <LoadingSpinner />
        ) : (
          <pre className={`whitespace-pre-wrap break-words text-sm ${isError ? 'text-red-accent' : 'text-text-primary'}`}>
            <code>{output || <span className="text-gray-500">Output will appear here...</span>}</code>
          </pre>
        )}
      </div>
    </div>
  );
};
