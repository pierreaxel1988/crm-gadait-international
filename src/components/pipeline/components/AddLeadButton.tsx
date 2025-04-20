
import React from 'react';
import { PlusCircle } from 'lucide-react';

interface AddLeadButtonProps {
  onClick: () => void;
}

const AddLeadButton: React.FC<AddLeadButtonProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 hidden md:block">
      <button 
        onClick={onClick} 
        className="text-white h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-colors bg-zinc-900 hover:bg-zinc-800"
      >
        <PlusCircle className="h-6 w-6" />
      </button>
    </div>
  );
};

export default AddLeadButton;
