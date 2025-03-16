
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { LeadSource } from '@/types/lead';

// Import our new components
import ManualImportForm from './import/ManualImportForm';
import EmailImportForm from './import/EmailImportForm';
import ImportResultDisplay from './import/ImportResultDisplay';
import { parseEmailContent } from './import/emailParsingUtils';

const LeadImportForm = () => {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [formMode, setFormMode] = useState<'manual' | 'email'>('manual');

  // Liste des sources définies dans les types
  const leadSources: LeadSource[] = [
    "Site web", 
    "Réseaux sociaux", 
    "Portails immobiliers", 
    "Network", 
    "Repeaters", 
    "Recommandations",
    "Apporteur d'affaire",
    "Idealista",
    "Le Figaro",
    "Properstar",
    "Property Cloud",
    "L'express Property"
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    property_reference: '',
    source: 'Site web' as LeadSource,
    message: '',
    integration_source: 'Manual import',
    assigned_to: undefined as string | undefined
  });

  const [emailContent, setEmailContent] = useState('');
  const [emailAssignedTo, setEmailAssignedTo] = useState<string | undefined>(undefined);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSourceChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      source: value as LeadSource
    }));
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('import-lead', {
        body: formData
      });
      
      if (error) {
        console.error("Erreur lors de l'importation du lead:", error);
        setError(`Erreur lors de l'importation : ${error.message}`);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: `Erreur lors de l'importation du lead : ${error.message}`
        });
        return;
      }
      
      setResult(data);
      toast({
        title: data.isNew ? "Lead créé avec succès" : "Lead mis à jour",
        description: `Le lead ${formData.name} a été ${data.isNew ? 'créé' : 'mis à jour'} avec succès.`
      });

      if (data.isNew) {
        setFormData({
          name: '',
          email: '',
          phone: '',
          property_reference: '',
          source: 'Site web',
          message: '',
          integration_source: 'Manual import',
          assigned_to: undefined
        });
      }
    } catch (err: any) {
      console.error("Erreur lors de l'importation du lead:", err);
      setError(`Erreur lors de l'importation : ${err.message || 'Erreur inconnue'}`);
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
    setError(null);
    
    try {
      if (!emailContent.trim()) {
        setError("Le contenu de l'email ne peut pas être vide");
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Le contenu de l'email ne peut pas être vide"
        });
        setLoading(false);
        return;
      }
      
      const extractedData = parseEmailContent(emailContent);
      
      if (emailAssignedTo) {
        extractedData.assigned_to = emailAssignedTo;
      }

      console.log("Données extraites pour l'importation:", extractedData);

      const { data, error: invokeError } = await supabase.functions.invoke('import-lead', {
        body: extractedData
      });
      
      if (invokeError) {
        console.error("Erreur lors de l'importation du lead:", invokeError);
        setError(`Erreur lors de l'importation : ${invokeError.message}`);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: `Erreur lors de l'importation du lead : ${invokeError.message}`
        });
        return;
      }
      
      if (!data || !data.success) {
        const errorMsg = data?.error || "Erreur inconnue lors de l'importation";
        setError(errorMsg);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: errorMsg
        });
        return;
      }
      
      setResult(data);
      toast({
        title: data.isNew ? "Lead créé avec succès" : "Lead mis à jour",
        description: `Le lead ${extractedData.name || 'sans nom'} a été ${data.isNew ? 'créé' : 'mis à jour'} avec succès.`
      });

      if (data.isNew) {
        setEmailContent('');
        setEmailAssignedTo(undefined);
      }
    } catch (err: any) {
      console.error("Erreur lors de l'importation du lead:", err);
      setError(`Erreur lors de l'importation : ${err.message || 'Erreur inconnue'}`);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'extraction ou de l'importation du lead."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={isMobile ? 'shadow-sm border' : ''}>
      <CardHeader className={isMobile ? 'px-3 py-2' : ''}>
        <CardTitle className={isMobile ? 'text-lg' : ''}>Importer un Lead</CardTitle>
      </CardHeader>
      <CardContent className={isMobile ? 'px-3 py-2' : ''}>
        <Tabs value={formMode} onValueChange={value => setFormMode(value as 'manual' | 'email')} className="w-full">
          <TabsList className={`grid w-full grid-cols-2 mb-3 md:mb-4 ${isMobile ? 'text-xs' : ''}`}>
            <TabsTrigger value="manual">Saisie Manuelle</TabsTrigger>
            <TabsTrigger value="email">Depuis un Email</TabsTrigger>
          </TabsList>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Erreur d'importation</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <TabsContent value="manual">
            <ManualImportForm
              formData={formData}
              handleInputChange={handleInputChange}
              handleSourceChange={handleSourceChange}
              handleSubmit={handleManualSubmit}
              loading={loading}
              leadSources={leadSources}
            />
          </TabsContent>
          
          <TabsContent value="email">
            <EmailImportForm
              emailContent={emailContent}
              setEmailContent={setEmailContent}
              emailAssignedTo={emailAssignedTo}
              setEmailAssignedTo={setEmailAssignedTo}
              handleSubmit={handleEmailSubmit}
              loading={loading}
            />
          </TabsContent>
        </Tabs>
        
        <ImportResultDisplay result={result} />
      </CardContent>
    </Card>
  );
};

export default LeadImportForm;
