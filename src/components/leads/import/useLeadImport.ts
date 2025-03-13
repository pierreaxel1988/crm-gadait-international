
import { useState } from 'react';
import { useSalesReps } from './hooks/useSalesReps';
import { useManualImport } from './hooks/useManualImport';
import { useEmailImport } from './hooks/useEmailImport';
import { useFileImport } from './hooks/useFileImport';

export const useLeadImport = () => {
  const [formMode, setFormMode] = useState<'manual' | 'email' | 'file'>('manual');
  const [result, setResult] = useState<any>(null);
  
  // Use the smaller hooks
  const { salesReps, loadingReps } = useSalesReps();
  const { 
    loading: manualLoading, 
    formData, 
    handleInputChange, 
    handleSelectChange, 
    handleManualSubmit 
  } = useManualImport();
  
  const { 
    loading: emailLoading, 
    emailContent, 
    emailAssignedTo, 
    setEmailContent, 
    setEmailAssignedTo, 
    handleEmailSubmit 
  } = useEmailImport(setResult);
  
  const { 
    loading: fileLoading, 
    uploadProgress, 
    selectedFile, 
    fileAssignedTo, 
    fileSourceType, 
    setFileAssignedTo, 
    handleSourceTypeChange, 
    handleFileSelected, 
    handleClearFile, 
    handleFileSubmit 
  } = useFileImport(setResult);

  // Determine overall loading state
  const loading = manualLoading || emailLoading || fileLoading;

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
