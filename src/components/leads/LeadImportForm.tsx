
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import TeamMemberSelect from './TeamMemberSelect';

const LeadImportForm = () => {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [formMode, setFormMode] = useState<'manual' | 'email'>('manual');

  // État pour le formulaire manuel
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    property_reference: '',
    source: 'Site web',
    message: '',
    integration_source: 'Manual import',
    assigned_to: undefined as string | undefined
  });

  // État pour l'importation par email
  const [emailContent, setEmailContent] = useState('');
  const [emailAssignedTo, setEmailAssignedTo] = useState<string | undefined>(undefined);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Utiliser la fonction Edge Function de Supabase pour importer le lead
      const {
        data,
        error
      } = await supabase.functions.invoke('import-lead', {
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
      
      // Extraire les informations de l'email
      const extractedData = parseEmailContent(emailContent);
      
      // Add the assignment information
      if (emailAssignedTo) {
        extractedData.assigned_to = emailAssignedTo;
      }

      // Utiliser la fonction Edge Function de Supabase pour importer le lead
      const {
        data,
        error: invokeError
      } = await supabase.functions.invoke('import-lead', {
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

      // Réinitialiser le formulaire
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

  // Fonction pour extraire les données d'un email
  const parseEmailContent = (emailText: string) => {
    const data: Record<string, any> = {
      integration_source: 'Email Parser'
    };

    // Détecter la source du portail immobilier
    if (emailText.includes('Propriétés Le Figaro')) {
      data.portal_name = 'Le Figaro';
      data.source = 'Le Figaro';
    } else if (emailText.includes('Properstar')) {
      data.portal_name = 'Properstar';
      data.source = 'Properstar';
    } else if (emailText.toLowerCase().includes('property cloud') || 
              emailText.includes('propertycloud.mu')) {
      data.portal_name = 'Property Cloud';
      data.source = 'Property Cloud';
    } else if (emailText.includes('Idealista')) {
      data.portal_name = 'Idealista';
      data.source = 'Idealista';
    }

    // Extraction du nom
    const nameMatch = emailText.match(/Name\s*:\s*([^\r\n]+)/i);
    if (nameMatch && nameMatch[1]) {
      data.name = nameMatch[1].trim();
    }

    // Extraction de l'email
    const emailMatch = emailText.match(/e-?mail\s*:\s*([^\r\n]+)/i);
    if (emailMatch && emailMatch[1]) {
      data.email = emailMatch[1].trim();
    }

    // Extraction du téléphone
    const phoneMatch = emailText.match(/Phone\s*:\s*([^\r\n]+)/i);
    if (phoneMatch && phoneMatch[1]) {
      data.phone = phoneMatch[1].trim();
    }

    // Extraction du pays
    const countryMatch = emailText.match(/Country\s*:\s*([^\r\n]+)/i);
    if (countryMatch && countryMatch[1]) {
      data.country = countryMatch[1].trim();
    }

    // Extraction de la référence de la propriété pour Property Cloud
    const propertyCloudRefMatch = emailText.match(/Property\s*:\s*(\d+)/i);
    if (propertyCloudRefMatch && propertyCloudRefMatch[1]) {
      data.property_reference = propertyCloudRefMatch[1].trim();
      
      // Chercher le reste des informations de propriété après la référence
      const fullPropertyLine = emailText.match(/Property\s*:\s*(\d+)([^\r\n]+)/i);
      if (fullPropertyLine && fullPropertyLine[2]) {
        const propertyInfo = fullPropertyLine[2].trim();
        
        // Essayer d'extraire la location et le prix
        const locationPriceMatch = propertyInfo.match(/\s*[-–]\s*([^-–]+)\s*[-–]\s*([^-–\r\n]+)/);
        if (locationPriceMatch) {
          data.desired_location = locationPriceMatch[1].trim();
          data.budget = locationPriceMatch[2].trim();
        }
      }
    }
    
    // Extraction plus générique de la référence de propriété et du prix
    if (!data.property_reference) {
      const genericPropertyMatch = emailText.match(/Property\s*:\s*(\d+)\s*-\s*([^-\r\n]+)\s*-\s*([^\r\n]+)/i);
      if (genericPropertyMatch) {
        data.property_reference = genericPropertyMatch[1].trim();
        data.desired_location = genericPropertyMatch[2].trim();
        data.budget = genericPropertyMatch[3].trim();
      }
    }

    // Extraction de l'URL
    const urlMatch = emailText.match(/url\s*:\s*([^\r\n]+)/i) || 
                     emailText.match(/https?:\/\/[^\s]+/i);
    if (urlMatch && urlMatch[1]) {
      data.property_url = urlMatch[1].trim();
      // Si la référence n'a pas été trouvée avant, essayer de l'extraire de l'URL
      if (!data.property_reference) {
        const urlRefMatch = urlMatch[1].match(/gad(\d+)/i);
        if (urlRefMatch && urlRefMatch[1]) {
          data.property_reference = urlRefMatch[1];
        }
      }
    }

    // Extraction du message
    const messageMatch = emailText.match(/Message\s*:\s*([\s\S]+?)(?=\s*Date|$)/i);
    if (messageMatch && messageMatch[1]) {
      data.message = messageMatch[1].trim();
    }
    
    // Si aucun email n'a été trouvé mais que le texte contient une adresse email, l'extraire
    if (!data.email) {
      const genericEmailMatch = emailText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (genericEmailMatch) {
        data.email = genericEmailMatch[0];
      }
    }
    
    // Fallback - si on n'a pas de nom mais qu'on a un email, utiliser la partie locale de l'email
    if (!data.name && data.email) {
      const emailLocalPart = data.email.split('@')[0];
      data.name = emailLocalPart
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
    }
    
    // S'assurer qu'il y a au moins un champ important rempli
    if (!data.name && !data.email && !data.phone) {
      data.name = "Contact sans nom";
    }
    
    return data;
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
            <form onSubmit={handleManualSubmit} className="space-y-3 md:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1 md:space-y-2">
                  <Label htmlFor="name" className={isMobile ? 'text-xs' : ''}>Nom complet</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className={isMobile ? 'h-8 text-sm' : ''} />
                </div>
                
                <div className="space-y-1 md:space-y-2">
                  <Label htmlFor="email" className={isMobile ? 'text-xs' : ''}>Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className={isMobile ? 'h-8 text-sm' : ''} />
                </div>
                
                <div className="space-y-1 md:space-y-2">
                  <Label htmlFor="phone" className={isMobile ? 'text-xs' : ''}>Téléphone</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className={isMobile ? 'h-8 text-sm' : ''} />
                </div>
                
                <div className="space-y-1 md:space-y-2">
                  <Label htmlFor="property_reference" className={isMobile ? 'text-xs' : ''}>Référence Propriété</Label>
                  <Input id="property_reference" name="property_reference" value={formData.property_reference} onChange={handleInputChange} className={isMobile ? 'h-8 text-sm' : ''} />
                </div>
                
                <div className="space-y-1 md:space-y-2">
                  <Label htmlFor="source" className={isMobile ? 'text-xs' : ''}>Source</Label>
                  <Input id="source" name="source" value={formData.source} onChange={handleInputChange} className={isMobile ? 'h-8 text-sm' : ''} />
                </div>
                
                <TeamMemberSelect 
                  value={formData.assigned_to}
                  onChange={(value) => setFormData(prev => ({ ...prev, assigned_to: value }))}
                />
              </div>
              
              <div className="space-y-1 md:space-y-2">
                <Label htmlFor="message" className={isMobile ? 'text-xs' : ''}>Message</Label>
                <Textarea id="message" name="message" rows={isMobile ? 3 : 4} value={formData.message} onChange={handleInputChange} className={isMobile ? 'text-sm' : ''} />
              </div>
              
              <Button type="submit" className={`w-full bg-loro-navy hover:bg-loro-navy/90 ${isMobile ? 'h-9 text-sm' : ''}`} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importation en cours...
                  </>
                ) : "Importer le lead"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="email">
            <form onSubmit={handleEmailSubmit} className="space-y-3 md:space-y-4">
              <div className="space-y-1 md:space-y-2">
                <Label htmlFor="emailContent" className={isMobile ? 'text-xs' : ''}>Contenu de l'email</Label>
                <Textarea 
                  id="emailContent" 
                  rows={isMobile ? 8 : 12} 
                  value={emailContent} 
                  onChange={e => setEmailContent(e.target.value)} 
                  placeholder="Collez ici le contenu complet de l'email..." 
                  className={`font-mono ${isMobile ? 'text-xs' : 'text-sm'}`} 
                  required 
                />
              </div>
              
              <TeamMemberSelect
                value={emailAssignedTo}
                onChange={setEmailAssignedTo}
              />
              
              <Button type="submit" className={`w-full bg-loro-navy hover:bg-loro-navy/90 ${isMobile ? 'h-9 text-sm' : ''}`} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyse et importation en cours...
                  </>
                ) : "Analyser et importer"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        
        {result && (
          <Alert className="mt-3 md:mt-4 text-sm">
            <AlertTitle>Résultat de l'importation</AlertTitle>
            <AlertDescription>
              <p>{result.message}</p>
              {result.data && (
                <pre className={`mt-2 bg-gray-50 p-2 rounded overflow-auto ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default LeadImportForm;
