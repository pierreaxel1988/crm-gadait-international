
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ManualImportForm from './import/ManualImportForm';
import EmailImportForm from './import/EmailImportForm';
import FileImportForm from './import/FileImportForm';
import ImportResult from './import/ImportResult';
import { useLeadImport } from './import/useLeadImport';

const LeadImportForm = () => {
  const {
    loading,
    result,
    formMode,
    setFormMode,
    salesReps,
    formData,
    emailContent,
    emailAssignedTo,
    fileAssignedTo,
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
    handleFileSelected,
    handleClearFile
  } = useLeadImport();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importer un Lead</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={formMode} onValueChange={value => setFormMode(value as 'manual' | 'email' | 'file')} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="manual">Saisie Manuelle</TabsTrigger>
            <TabsTrigger value="email">Depuis un Email</TabsTrigger>
            <TabsTrigger value="file">Fichier CSV/Excel</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual">
            <ManualImportForm
              formData={formData}
              salesReps={salesReps}
              loading={loading}
              onInputChange={handleInputChange}
              onSelectChange={handleSelectChange}
              onSubmit={handleManualSubmit}
            />
          </TabsContent>
          
          <TabsContent value="email">
            <EmailImportForm
              emailContent={emailContent}
              emailAssignedTo={emailAssignedTo}
              salesReps={salesReps}
              loading={loading}
              setEmailContent={setEmailContent}
              setEmailAssignedTo={setEmailAssignedTo}
              onSubmit={handleEmailSubmit}
            />
          </TabsContent>
          
          <TabsContent value="file">
            <FileImportForm
              fileAssignedTo={fileAssignedTo}
              salesReps={salesReps}
              loading={loading}
              uploadProgress={uploadProgress}
              selectedFile={selectedFile}
              onFileSelected={handleFileSelected}
              setFileAssignedTo={setFileAssignedTo}
              onSubmit={handleFileSubmit}
              onClearFile={handleClearFile}
            />
          </TabsContent>
        </Tabs>
        
        <ImportResult result={result} />
      </CardContent>
    </Card>
  );
};

export default LeadImportForm;
