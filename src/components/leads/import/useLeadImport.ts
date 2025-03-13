
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { parseEmailContent, normalizeLeadData } from './emailParser';

export const useLeadImport = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [formMode, setFormMode] = useState<'manual' | 'email'>('manual');
  const [salesReps, setSalesReps] = useState<{id: string, name: string}[]>([]);
  const [loadingReps, setLoadingReps] = useState(false);

  // État pour le formulaire manuel
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    property_reference: '',
    source: 'Site web',
    message: '',
    integration_source: 'Manual import',
    assigned_to: ''
  });

  // État pour l'importation par email
  const [emailContent, setEmailContent] = useState('');
  const [emailAssignedTo, setEmailAssignedTo] = useState('');

  // Chargement des commerciaux
  useEffect(() => {
    const fetchSalesReps = async () => {
      setLoadingReps(true);
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('id, name')
          .order('name');
        
        if (error) throw error;
        setSalesReps(data || []);
      } catch (err) {
        console.error("Erreur lors du chargement des commerciaux:", err);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger la liste des commerciaux."
        });
      } finally {
        setLoadingReps(false);
      }
    };

    fetchSalesReps();
  }, []);

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
    result,
    formMode,
    setFormMode,
    salesReps,
    loadingReps,
    formData,
    emailContent,
    emailAssignedTo,
    handleInputChange,
    handleSelectChange,
    handleManualSubmit,
    handleEmailSubmit,
    setEmailContent,
    setEmailAssignedTo
  };
};
