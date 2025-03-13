
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { parseEmailContent } from '../emailParser';
import { normalizeLeadData } from '../emailParser/utils';

export const useEmailImport = (setResult: (result: any) => void) => {
  const [loading, setLoading] = useState(false);
  const [emailContent, setEmailContent] = useState('');
  const [emailAssignedTo, setEmailAssignedTo] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Extraire les informations de l'email avec le parseur amélioré
      const extractedData = parseEmailContent(emailContent);
      
      // Normaliser les données extraites
      const normalizedData = normalizeLeadData(extractedData);
      
      // Ajouter le commercial assigné
      if (emailAssignedTo) {
        normalizedData.assigned_to = emailAssignedTo;
      }

      // Utiliser la fonction Edge Function de Supabase pour importer le lead
      const { data, error } = await supabase.functions.invoke('import-lead', {
        body: normalizedData
      });
      if (error) throw error;
      setResult(data);
      toast({
        title: data.isNew ? "Lead créé avec succès" : "Lead mis à jour",
        description: `Le lead ${normalizedData.name || 'sans nom'} a été ${data.isNew ? 'créé' : 'mis à jour'} avec succès.`
      });

      // Réinitialiser le formulaire
      if (data.isNew) {
        setEmailContent('');
        // On garde le commercial sélectionné
      }
    } catch (err) {
      console.error("Erreur lors de l'importation du lead:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'extraction ou de l'importation du lead."
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    emailContent,
    emailAssignedTo,
    setEmailContent,
    setEmailAssignedTo,
    handleEmailSubmit
  };
};
