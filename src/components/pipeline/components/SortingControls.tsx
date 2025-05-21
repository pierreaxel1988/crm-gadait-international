
import React from 'react';
import { SortingControlsProps, SortBy } from '../types/pipelineTypes';

const SortingControls: React.FC<SortingControlsProps> = ({ sortBy, onSortChange }) => {
  return (
    <div className="flex flex-wrap gap-3 items-center justify-between bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Trier par:</span>
        <div className="flex space-x-2">
          <button 
            onClick={() => onSortChange('priority')}
            className={`px-3 py-1 rounded-md ${sortBy === 'priority' 
              ? 'bg-zinc-900 text-white' 
              : 'bg-gray-100 text-gray-600'}`}
          >
            Priorité
          </button>
          <button 
            onClick={() => onSortChange('newest')}
            className={`px-3 py-1 rounded-md ${sortBy === 'newest' 
              ? 'bg-zinc-900 text-white' 
              : 'bg-gray-100 text-gray-600'}`}
          >
            Plus récent
          </button>
          <button 
            onClick={() => onSortChange('oldest')}
            className={`px-3 py-1 rounded-md ${sortBy === 'oldest' 
              ? 'bg-zinc-900 text-white' 
              : 'bg-gray-100 text-gray-600'}`}
          >
            Plus ancien
          </button>
        </div>
      </div>
    </div>
  );
};

export default SortingControls;
