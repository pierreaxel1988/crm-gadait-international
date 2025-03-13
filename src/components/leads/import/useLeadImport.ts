
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { parseEmailContent, normalizeLeadData } from './emailParser';

export const useLeadImport = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [formMode, setFormMode] = useState<'manual' | 'email' | 'file'>('manual');
  const [salesReps, setSalesReps] = useState<{id: string, name: string}[]>([]);
  const [loadingReps, setLoadingReps] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
  
  // État pour l'importation par fichier
  const [fileAssignedTo, setFileAssignedTo] = useState('unassigned');
  const [fileSourceType, setFileSourceType] = useState('CSV Import');

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
  
  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setUploadProgress(0);
    }
  };
  
  const handleClearFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };
  
  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un fichier à importer."
      });
      return;
    }
    
    setLoading(true);
    setUploadProgress(0);
    
    try {
      // Créer un FormData pour envoyer le fichier
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('assigned_to', fileAssignedTo === 'unassigned' ? '' : fileAssignedTo);
      formData.append('source_type', fileSourceType);
      
      // Appel à la fonction Edge pour importer le fichier
      const { data, error } = await supabase.functions.invoke('import-leads-csv', {
        body: formData,
        // Pas de support de l'upload progress avec supabase.functions.invoke
      });
      
      if (error) throw error;
      
      // Simuler une progression pour l'interface utilisateur
      const duration = 1500; // ms
      const interval = 100; // ms
      const steps = duration / interval;
      let currentStep = 0;
      
      const progressInterval = setInterval(() => {
        currentStep++;
        const newProgress = Math.min(99, Math.floor((currentStep / steps) * 100));
        setUploadProgress(newProgress);
        
        if (currentStep >= steps) {
          clearInterval(progressInterval);
          setUploadProgress(100);
          
          // Afficher les résultats
          setResult(data);
          
          const hasDuplicates = data.duplicates && data.duplicates.length > 0;
          
          toast({
            title: "Importation réussie",
            description: `${data.importedCount} leads importés, ${data.updatedCount} mis à jour${hasDuplicates ? `, ${data.duplicatesCount} doublons détectés` : ''}`
          });
          
          // Réinitialiser le formulaire après un court délai
          setTimeout(() => {
            setSelectedFile(null);
            setUploadProgress(0);
            setLoading(false);
          }, 500);
        }
      }, interval);
      
    } catch (err) {
      console.error("Erreur lors de l'importation du fichier:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'importation du fichier."
      });
      setLoading(false);
      setUploadProgress(0);
    }
  };
  
  const handleSourceTypeChange = (value: string) => {
    setFileSourceType(value);
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
    fileAssignedTo,
    fileSourceType,
    selectedFile,
    uploadProgress,
    handleInputChange,
    handleSelectChange,
    handleManualSubmit,
    handleEmailSubmit,
    handleFileSubmit,
    setEmailContent,
    setEmailAssignedTo,
    setFileAssignedTo,
    handleSourceTypeChange,
    handleFileSelected,
    handleClearFile
  };
};
