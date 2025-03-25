
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MobileQuickImport from '@/components/mobile/MobileQuickImport';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const MobileLeadImport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const pipelineType = queryParams.get('pipelineType') || 'purchase';
  const [importOpen, setImportOpen] = useState(true);
  const [leadCount, setLeadCount] = useState(0);

  // Récupérer le nombre de leads au chargement
  useEffect(() => {
    const fetchLeadCount = async () => {
      try {
        const { count, error } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true });
          
        if (error) {
          console.error('Error fetching leads count:', error);
          return;
        }
        
        setLeadCount(count || 0);
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    };
    
    fetchLeadCount();
  }, []);

  // Close dialog and navigate back when the dialog is closed
  const handleClose = () => {
    setImportOpen(false);
    navigate(-1);
  };

  // Handle successful lead creation
  const handleSuccess = () => {
    toast({
      title: "Lead créé avec succès",
      description: "Votre lead a été ajouté à la base de données.",
      duration: 3000,
    });
    navigate('/pipeline');
  };

  // Auto-close if user presses back button on the browser
  useEffect(() => {
    const handlePopState = () => {
      setImportOpen(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <div className="p-4 flex flex-col h-screen">
      <div className="flex items-center mb-4">
        <Button 
          variant="outline" 
          size="icon" 
          className="mr-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Import de Lead</h1>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center">
        {leadCount === 0 ? (
          <p className="text-gray-500 mb-4 text-center">
            Vous n'avez pas encore de leads. Importez votre premier lead pour commencer.
          </p>
        ) : (
          <p className="text-gray-500 mb-4 text-center">
            Importez rapidement un nouveau lead pour votre pipeline
          </p>
        )}
        
        <Button 
          className="w-full max-w-xs"
          onClick={() => setImportOpen(true)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Importer un nouveau lead
        </Button>
        
        <Button 
          variant="outline"
          className="w-full max-w-xs mt-3"
          onClick={() => navigate(`/leads/new?pipeline=${pipelineType}`)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Créer un lead manuellement
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
