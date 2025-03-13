
import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ApiHeader from '@/components/api/ApiHeader';
import ParametersTable from '@/components/api/ParametersTable';
import ApiExamples from '@/components/api/ApiExamples';
import ApiIntegrationTips from '@/components/api/ApiIntegrationTips';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const LeadApiGuide = () => {
  const isMobile = useIsMobile();
  const baseApiUrl = 'https://hxqoqkfnhbpwzkjgukrc.supabase.co/functions/v1/import-lead';
  const apiKeyPlaceholder = 'votre-clé-API-supabase';
  
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapingResults, setScrapingResults] = useState<any>(null);
  
  const requiredParameters = [{
    name: 'name',
    description: 'Nom complet du lead'
  }, {
    name: 'email',
    description: 'Adresse e-mail du lead'
  }];
  
  const portalParameters = [{
    name: 'portal_name',
    description: 'Nom du portail immobilier (Le Figaro, Idealista, etc.)'
  }, {
    name: 'property_reference',
    description: 'Référence de votre bien immobilier'
  }, {
    name: 'reference_portal',
    description: 'Référence du bien sur le portail'
  }, {
    name: 'property_type',
    description: 'Type de bien (Villa, Appartement, Chalet, etc.)'
  }, {
    name: 'budget_min / budget_max',
    description: 'Budget min/max du prospect'
  }, {
    name: 'desired_location',
    description: 'Localisation souhaitée'
  }];
  
  const assignmentParameters = [{
    name: 'assigned_to',
    description: 'ID du membre de l\'équipe à qui assigner le lead (UUID)'
  }];
  
  const handleWebsiteScrape = async () => {
    if (!websiteUrl) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une URL valide",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setScrapingResults(null);
    
    try {
      // Call the scrape-website edge function with the URL
      const { data, error } = await supabase.functions.invoke('scrape-website', {
        body: { url: websiteUrl }
      });
      
      if (error) throw error;
      
      setScrapingResults(data);
      
      if (data.success) {
        toast({
          title: "Succès",
          description: `${data.properties?.length || 0} propriétés trouvées sur le site`
        });
      } else {
        toast({
          title: "Avertissement",
          description: data.message || "Aucune propriété trouvée ou problème lors de l'extraction"
        });
      }
    } catch (err) {
      console.error("Erreur lors de l'extraction du site web:", err);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'extraction du site web",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="luxury-card p-3 md:p-6 overflow-auto max-w-full">
      <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Guide d'intégration API</h2>
      
      <Tabs defaultValue="api" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="api">API REST</TabsTrigger>
          <TabsTrigger value="website">Import Site Web</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api">
          <Alert className="mb-4 md:mb-6 text-sm md:text-base">
            <AlertTitle className="font-semibold">Important</AlertTitle>
            <AlertDescription>Cette API vous permet d'importer automatiquement des leads de vos portails immobiliers dans votre CRM Gadait. Vous aurez besoin d'une clé API Supabase pour authentifier vos requêtes.</AlertDescription>
          </Alert>
          
          <div className={isMobile ? 'space-y-4' : ''}>
            <ApiHeader baseApiUrl={baseApiUrl} />
            
            <ParametersTable title="Paramètres obligatoires" parameters={requiredParameters} />
            
            <ParametersTable title="Paramètres spécifiques aux portails" parameters={portalParameters} />
            
            <ParametersTable title="Paramètres d'attribution" parameters={assignmentParameters} />
            
            <ApiExamples baseApiUrl={baseApiUrl} apiKeyPlaceholder={apiKeyPlaceholder} />
            
            <ApiIntegrationTips />
          </div>
        </TabsContent>
        
        <TabsContent value="website">
          <Alert className="mb-4 md:mb-6 text-sm md:text-base">
            <AlertTitle className="font-semibold">Extraction de Sites Web</AlertTitle>
            <AlertDescription>
              Cette fonctionnalité vous permet d'extraire des propriétés de sites web immobiliers comme The Private Collection et de les importer directement dans votre CRM.
            </AlertDescription>
          </Alert>
          
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <p className="text-sm">Entrez l'URL d'un site immobilier pour extraire les propriétés :</p>
                
                <div className="flex gap-2">
                  <Input 
                    value={websiteUrl} 
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://the-private-collection.com/en/search/"
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleWebsiteScrape}
                    disabled={isLoading}
                    className="bg-loro-navy hover:bg-loro-navy/90"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Extraction...
                      </>
                    ) : "Extraire"}
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  <p>Sites web actuellement supportés :</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>The Private Collection (https://the-private-collection.com)</li>
                    <li>Autres sites immobiliers de luxe (support limité)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {scrapingResults && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Résultats ({scrapingResults.properties?.length || 0} propriétés)</h3>
              
              {scrapingResults.properties && scrapingResults.properties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scrapingResults.properties.map((property: any, index: number) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <p className="font-medium">{property.title || 'Propriété sans titre'}</p>
                          <p className="text-sm text-muted-foreground">{property.location}</p>
                          <p className="text-sm">{property.price}</p>
                          <p className="text-xs">{property.description?.substring(0, 100)}...</p>
                          <p className="text-xs text-muted-foreground">Référence: {property.reference || 'N/A'}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    Aucune propriété n'a été trouvée sur ce site ou l'extraction a échoué.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadApiGuide;
