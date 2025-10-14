
import React, { useState } from 'react';
import { ClipboardCheckIcon, ClipboardIcon } from './Icons';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  codeId: string | null;
}

export const SaveModal: React.FC<SaveModalProps> = ({ isOpen, onClose, codeId }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (codeId) {
      navigator.clipboard.writeText(codeId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-secondary rounded-lg shadow-xl p-6 w-full max-w-md m-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
        <h2 className="text-2xl font-bold text-text-primary mb-4">Code Saved!</h2>
        <p className="text-text-secondary mb-4">Your code has been saved. Use the following ID to load it back anytime:</p>
        <div className="flex items-center space-x-2 bg-primary p-3 rounded-md border border-gray-700">
          <input
            type="text"
            readOnly
            value={codeId || ''}
            className="flex-1 bg-transparent text-green-accent font-mono focus:outline-none"
          />
          <button onClick={handleCopy} className="p-2 rounded-md hover:bg-gray-700 transition-colors text-text-secondary">
            {copied ? <ClipboardCheckIcon /> : <ClipboardIcon />}
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-accent hover:bg-accent/90 text-white font-bold py-2 px-4 rounded-md transition-colors"
        >
          Close
        </button>
      </div>
       <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
