
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ApiHeader from '@/components/api/ApiHeader';
import ParametersTable from '@/components/api/ParametersTable';
import ApiExamples from '@/components/api/ApiExamples';
import ApiIntegrationTips from '@/components/api/ApiIntegrationTips';

const LeadApiGuide = () => {
  const baseApiUrl = 'https://hxqoqkfnhbpwzkjgukrc.supabase.co/functions/v1/import-lead';
  const apiKeyPlaceholder = 'votre-clé-API-supabase';
  
  const requiredParameters = [
    { name: 'name', description: 'Nom complet du lead' },
    { name: 'email', description: 'Adresse e-mail du lead' },
  ];
  
  const portalParameters = [
    { name: 'portal_name', description: 'Nom du portail immobilier (Le Figaro, Idealista, etc.)' },
    { name: 'property_reference', description: 'Référence de votre bien immobilier' },
    { name: 'reference_portal', description: 'Référence du bien sur le portail' },
    { name: 'property_type', description: 'Type de bien (Villa, Appartement, Chalet, etc.)' },
    { name: 'budget_min / budget_max', description: 'Budget min/max du prospect' },
    { name: 'desired_location', description: 'Localisation souhaitée' },
  ];

  return (
    <div className="luxury-card p-6">
      <h2 className="text-xl font-semibold mb-4">Guide d'intégration API</h2>
      
      <Alert className="mb-6">
        <AlertTitle className="font-semibold">Important</AlertTitle>
        <AlertDescription>
          Cette API vous permet d'importer automatiquement des leads de vos portails immobiliers dans votre CRM Loro.
          Vous aurez besoin d'une clé API Supabase pour authentifier vos requêtes.
        </AlertDescription>
      </Alert>
      
      <ApiHeader baseApiUrl={baseApiUrl} />
      
      <ParametersTable title="Paramètres obligatoires" parameters={requiredParameters} />
      
      <ParametersTable title="Paramètres spécifiques aux portails" parameters={portalParameters} />
      
      <ApiExamples baseApiUrl={baseApiUrl} apiKeyPlaceholder={apiKeyPlaceholder} />
      
      <ApiIntegrationTips />
    </div>
  );
};

export default LeadApiGuide;
