
import React, { useState } from 'react';

interface LoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (id: string) => void;
}

export const LoadModal: React.FC<LoadModalProps> = ({ isOpen, onClose, onLoad }) => {
  const [id, setId] = useState('');

  const handleLoad = () => {
    onLoad(id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-secondary rounded-lg shadow-xl p-6 w-full max-w-md m-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
        <h2 className="text-2xl font-bold text-text-primary mb-4">Load Code</h2>
        <p className="text-text-secondary mb-4">Enter the save ID to load your code snippet.</p>
        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="Enter save ID..."
          className="w-full bg-primary p-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent text-text-primary font-mono"
        />
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleLoad}
            className="px-4 py-2 bg-accent hover:bg-accent/90 text-white font-bold rounded-md transition-colors"
          >
            Load
          </button>
        </div>
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
