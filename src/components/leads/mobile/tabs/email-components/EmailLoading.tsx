
import React from 'react';

const EmailLoading: React.FC = () => {
  return (
    <div className="p-4 flex flex-col items-center justify-center h-40">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-loro-hazel"></div>
      <p className="mt-2 text-sm text-gray-500">Chargement...</p>
    </div>
  );
};

export default EmailLoading;
