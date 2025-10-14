
import React, { useState } from 'react';
import type { SavedFile } from '../types';

interface FileExplorerProps {
  files: SavedFile[];
  activeFileId: string | null;
  onSelectFile: (id: string) => void;
  onNewFile: () => void;
  onDeleteFile: (id: string) => void;
  onRenameFile: (id: string, newName: string) => void;
}

const PlusIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);


export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onNewFile,
  onDeleteFile,
  onRenameFile,
}) => {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  const handleRename = (file: SavedFile) => {
    setRenamingId(file.id);
    setTempName(file.name);
  };
  
  const handleRenameSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (renamingId && tempName.trim()) {
        onRenameFile(renamingId, tempName.trim());
    }
    setRenamingId(null);
  };

  return (
    <aside className="w-1/4 max-w-xs bg-secondary flex flex-col border-r border-gray-700">
      <div className="flex justify-between items-center p-3 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-text-secondary">Files</h2>
        <button
          onClick={onNewFile}
          className="p-1.5 rounded-md text-text-secondary hover:bg-accent/20 hover:text-accent transition-colors"
          title="New File"
        >
          <PlusIcon />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {files.map((file) => (
          <div
            key={file.id}
            onDoubleClick={() => handleRename(file)}
            className={`flex items-center justify-between p-3 text-sm cursor-pointer transition-colors ${
              activeFileId === file.id ? 'bg-accent/30 text-accent' : 'text-text-primary hover:bg-primary'
            }`}
            onClick={() => onSelectFile(file.id)}
          >
            {renamingId === file.id ? (
              <form onSubmit={handleRenameSubmit} className="w-full">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={() => setRenamingId(null)}
                  autoFocus
                  className="bg-primary border border-accent rounded-sm px-1 w-full text-sm outline-none"
                />
              </form>
            ) : (
              <span className="truncate flex-1" title={file.name}>{file.name}</span>
            )}
            {activeFileId === file.id && renamingId !== file.id && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete ${file.name}?`)) {
                            onDeleteFile(file.id);
                        }
                    }}
                    className="ml-2 p-1 rounded-md text-red-accent/70 hover:bg-red-accent/20 hover:text-red-accent transition-colors"
                    title="Delete File"
                >
                    <TrashIcon />
                </button>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};
