
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useFileImport = (setResult: (result: any) => void) => {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileAssignedTo, setFileAssignedTo] = useState('unassigned');
  const [fileSourceType, setFileSourceType] = useState('CSV Import');

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
  
  const handleSourceTypeChange = (value: string) => {
    setFileSourceType(value);
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

  return {
    loading,
    uploadProgress,
    selectedFile,
    fileAssignedTo,
    fileSourceType,
    setFileAssignedTo,
    handleSourceTypeChange,
    handleFileSelected,
    handleClearFile,
    handleFileSubmit
  };
};
