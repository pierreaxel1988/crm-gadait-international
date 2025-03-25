
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
    <div className="p-4">
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

      <Button 
        className="w-full"
        onClick={() => setImportOpen(true)}
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Importer un nouveau lead
      </Button>

      <MobileQuickImport 
        isOpen={importOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default MobileLeadImport;
