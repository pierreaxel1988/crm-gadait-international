import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import ImportedLeadsPanel from '@/components/leads/ImportedLeadsPanel';
import { getLeads } from '@/services/leadService';
import { LeadDetailed } from '@/types/lead';
import MobileQuickImport from '@/components/mobile/MobileQuickImport';

const MobileLeadImport = () => {
  const navigate = useNavigate();
  const [isQuickImportOpen, setIsQuickImportOpen] = useState(false);
  const [leads, setLeads] = useState<LeadDetailed[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const fetchedLeads = await getLeads();
      setLeads(fetchedLeads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les leads."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleBackClick = () => {
    navigate('/pipeline');
  };

  return (
    <div className="container mx-auto mt-6">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" onClick={handleBackClick}>
          Retour
        </Button>
        <Button onClick={() => setIsQuickImportOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Ajout rapide
        </Button>
      </div>

      {isQuickImportOpen && (
        <MobileQuickImport 
          onClose={() => setIsQuickImportOpen(false)}
          onSuccess={() => {
            setIsQuickImportOpen(false);
            fetchLeads();
          }}
        />
      )}

      <ImportedLeadsPanel leads={leads} isLoading={isLoading} />
    </div>
  );
};

export default MobileLeadImport;
