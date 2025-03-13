
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface FormData {
  name: string;
  email: string;
  phone: string;
  property_reference: string;
  source: string;
  message: string;
  integration_source: string;
  assigned_to: string;
}

export const useManualImport = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    property_reference: '',
    source: 'Site web',
    message: '',
    integration_source: 'Manual import',
    assigned_to: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Utiliser la fonction Edge Function de Supabase pour importer le lead
      const { data, error } = await supabase.functions.invoke('import-lead', {
        body: formData
      });
      if (error) throw error;
      setResult(data);
      toast({
        title: data.isNew ? "Lead créé avec succès" : "Lead mis à jour",
        description: `Le lead ${formData.name} a été ${data.isNew ? 'créé' : 'mis à jour'} avec succès.`
      });

      // Réinitialiser le formulaire si c'est un nouveau lead
      if (data.isNew) {
        setFormData({
          name: '',
          email: '',
          phone: '',
          property_reference: '',
          source: 'Site web',
          message: '',
          integration_source: 'Manual import',
          assigned_to: formData.assigned_to // Conserver le commercial sélectionné
        });
      }
    } catch (err) {
      console.error("Erreur lors de l'importation du lead:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'importation du lead."
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    result,
    formData,
    handleInputChange,
    handleSelectChange,
    handleManualSubmit,
    setResult
  };
};
