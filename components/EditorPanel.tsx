
import React from 'react';
import { PlayIcon, SaveIcon, FolderOpenIcon, TrashIcon } from './Icons';

interface EditorPanelProps {
  code: string;
  setCode: (code: string) => void;
  onRun: () => void;
  onSave: () => void;
  onLoad: () => void;
  onClear: () => void;
  isLoading: boolean;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  code,
  setCode,
  onRun,
  onSave,
  onLoad,
  onClear,
  isLoading,
}) => {
  return (
    <div className="flex flex-col w-full md:w-1/2 p-4 bg-primary h-1/2 md:h-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-text-secondary">Python Editor</h2>
        <div className="flex items-center space-x-2">
          <ActionButton onClick={onRun} disabled={isLoading} tooltip="Run Code">
            <PlayIcon />
            {isLoading ? 'Running...' : 'Run'}
          </ActionButton>
          <ActionButton onClick={onSave} disabled={isLoading} tooltip="Save Code">
            <SaveIcon />
            Save
          </ActionButton>
          <ActionButton onClick={onLoad} disabled={isLoading} tooltip="Load Code">
            <FolderOpenIcon />
            Load
          </ActionButton>
          <ActionButton onClick={onClear} disabled={isLoading} variant="danger" tooltip="Clear Editor">
             <TrashIcon />
          </ActionButton>
        </div>
      </div>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="flex-1 w-full bg-secondary p-4 rounded-md font-mono text-text-primary border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
        placeholder="Write your Python code here..."
        spellCheck="false"
      />
    </div>
  );
};

interface ActionButtonProps {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
  variant?: 'default' | 'danger';
  tooltip: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, disabled, children, variant = 'default', tooltip }) => {
  const baseClasses = "flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-secondary";
  const colorClasses = variant === 'danger'
    ? "bg-red-accent/80 hover:bg-red-accent text-white"
    : "bg-accent/80 hover:bg-accent text-white";
  const disabledClasses = "disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} ${colorClasses} ${disabledClasses}`}
      >
        {children}
      </button>
      <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
        {tooltip}
      </div>
    </div>
  );
};
