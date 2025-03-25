
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MobileQuickImport from '@/components/mobile/MobileQuickImport';

const MobileLeadImport = () => {
  const navigate = useNavigate();
  const [importOpen, setImportOpen] = useState(true);

  const handleClose = () => {
    setImportOpen(false);
    navigate('/pipeline');
  };

  const handleSuccess = () => {
    // This will be handled by the dialog's navigation
  };

  return (
    <div className="p-4 flex flex-col h-screen">
      <div className="flex items-center mb-4">
        <Button 
          variant="outline" 
          size="icon" 
          className="mr-2"
          onClick={() => navigate('/pipeline')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Import de Lead</h1>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center">
        <p className="text-gray-500 mb-4 text-center">
          Importez rapidement un nouveau lead pour votre pipeline
        </p>
        
        <Button 
          className="w-full max-w-xs"
          onClick={() => setImportOpen(true)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Importer un nouveau lead
        </Button>
      </div>

      <MobileQuickImport 
        isOpen={importOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default MobileLeadImport;
