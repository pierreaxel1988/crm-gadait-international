
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SaveIndicatorProps {
  show: boolean;
}

const SaveIndicator: React.FC<SaveIndicatorProps> = ({ show }) => {
  if (!show) return null;
  
  return (
    <div className="fixed top-16 right-4 bg-chocolate-dark text-white p-2 rounded-full shadow-md animate-[fade-in_0.3s_ease-out]">
      <CheckCircle className="h-5 w-5" />
    </div>
  );
};

export default SaveIndicator;
