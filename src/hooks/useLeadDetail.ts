
import { useState, useCallback, useEffect } from 'react';
import { LeadDetailed } from '@/types/lead';
import { ActionHistory } from '@/types/actionHistory';
import { getLead, updateLead } from '@/services/leadService';
import { toast } from '@/hooks/use-toast';

export function useLeadDetail(id: string | undefined) {
  const [lead, setLead] = useState<LeadDetailed | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  const fetchLead = useCallback(async () => {
    if (id) {
      try {
        setIsLoading(true);
        const leadData = await getLead(id);
        console.log("Fetched lead data:", leadData);
        setLead(leadData || undefined);
        setHasChanges(false);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les informations du lead."
        });
      } finally {
        setIsLoading(false);
      }
    }
  }, [id]);
  
  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  const handleSave = async () => {
    if (!lead) return;
    
    try {
      setIsSaving(true);
      console.log("Saving lead data:", lead);
      
      const updatedLead = await updateLead(lead);
      if (updatedLead) {
        toast({
          title: "Lead mis à jour",
          description: "Les modifications ont été enregistrées avec succès."
        });
        setHasChanges(false);
      }
    } catch (error) {
      console.error("Error saving lead:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'enregistrer les modifications."
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (hasChanges && autoSaveEnabled && lead) {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      const timer = setTimeout(() => {
        handleSave();
      }, 2000);
      
      setAutoSaveTimer(timer);
    }
    
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [lead, hasChanges, autoSaveEnabled]);

  const handleDataChange = (data: Partial<LeadDetailed>) => {
    if (!lead) return;
    
    console.log("Data change triggered:", data);
    
    setLead(prev => {
      if (!prev) return prev;
      return { ...prev, ...data };
    });
    
    setHasChanges(true);
  };

  return {
    lead,
    setLead,
    isLoading,
    isSaving,
    hasChanges,
    autoSaveEnabled,
    setAutoSaveEnabled,
    handleSave,
    handleDataChange,
    fetchLead
  };
}
