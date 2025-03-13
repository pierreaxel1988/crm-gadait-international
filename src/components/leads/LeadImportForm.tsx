
import React, { useState } from 'react';
import { Loader2, User, Mail, Phone, Home, Globe, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const LeadImportForm = () => {
  const [loading, setLoading] = useState(false);
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
    integration_source: 'Manual import'
  });

  // État pour l'importation par email
  const [emailContent, setEmailContent] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        description: `Le lead ${formData.name} a été ${data.isNew ? 'créé' : 'mis à jour'} avec succès.`,
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
          integration_source: 'Manual import'
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
      // Extraire les informations de l'email
      const extractedData = parseEmailContent(emailContent);
      
      // Utiliser la fonction Edge Function de Supabase pour importer le lead
      const { data, error } = await supabase.functions.invoke('import-lead', {
        body: extractedData
      });
      
      if (error) throw error;
      
      setResult(data);
      toast({
        title: data.isNew ? "Lead créé avec succès" : "Lead mis à jour",
        description: `Le lead ${extractedData.name || 'sans nom'} a été ${data.isNew ? 'créé' : 'mis à jour'} avec succès.`,
      });
      
      // Réinitialiser le formulaire
      if (data.isNew) {
        setEmailContent('');
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

  // Fonction pour extraire les données d'un email
  const parseEmailContent = (emailText: string) => {
    const data: Record<string, any> = {
      integration_source: 'Email Parser'
    };
    
    // Détecter la source du portail
    if (emailText.includes('Propriétés Le Figaro')) {
      data.portal_name = 'Le Figaro';
      data.source = 'Le Figaro';
    } else if (emailText.includes('Properstar')) {
      data.portal_name = 'Properstar';
      data.source = 'Properstar';
    } else if (emailText.includes('Property Cloud')) {
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
    
    // Extraction de la référence de la propriété et du prix
    const propertyMatch = emailText.match(/Property\s*:\s*(\d+)\s*-\s*([^-\r\n]+)\s*-\s*([^\r\n]+)/i);
    if (propertyMatch) {
      data.property_reference = propertyMatch[1].trim();
      data.desired_location = propertyMatch[2].trim();
      data.budget = propertyMatch[3].trim();
    }
    
    // Extraction de l'URL
    const urlMatch = emailText.match(/url\s*:\s*([^\r\n]+)/i);
    if (urlMatch && urlMatch[1]) {
      // Si la référence n'a pas été trouvée avant, utiliser l'URL comme référence
      if (!data.property_reference) {
        data.property_reference = urlMatch[1].trim();
      }
    }
    
    // Extraction du message
    const messageMatch = emailText.match(/Message\s*:\s*([\s\S]+?)(?=Date|$)/i);
    if (messageMatch && messageMatch[1]) {
      data.message = messageMatch[1].trim();
    }
    
    return data;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-times text-loro-navy mb-6">Importer un Lead</h2>
      
      <Tabs value={formMode} onValueChange={(value) => setFormMode(value as 'manual' | 'email')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-loro-white/50 p-1 rounded-md">
          <TabsTrigger 
            value="manual" 
            className="rounded-sm py-3 text-base font-medium text-loro-navy data-[state=active]:bg-white data-[state=active]:text-loro-terracotta data-[state=active]:shadow-md transition-all"
          >
            Saisie Manuelle
          </TabsTrigger>
          <TabsTrigger 
            value="email" 
            className="rounded-sm py-3 text-base font-medium text-loro-navy data-[state=active]:bg-white data-[state=active]:text-loro-terracotta data-[state=active]:shadow-md transition-all"
          >
            Importer depuis un Email
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual" className="focus-visible:outline-none">
          <form onSubmit={handleManualSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-loro-navy font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nom complet <span className="text-loro-terracotta">*</span>
                </Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                  className="border-gray-200 focus:border-loro-terracotta focus:ring-loro-terracotta/20"
                  placeholder="Prénom et nom du client"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-loro-navy font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email <span className="text-loro-terracotta">*</span>
                </Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  required 
                  className="border-gray-200 focus:border-loro-terracotta focus:ring-loro-terracotta/20"
                  placeholder="email@exemple.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-loro-navy font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Téléphone
                </Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  className="border-gray-200 focus:border-loro-terracotta focus:ring-loro-terracotta/20"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="property_reference" className="text-loro-navy font-medium flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Référence Propriété
                </Label>
                <Input 
                  id="property_reference" 
                  name="property_reference" 
                  value={formData.property_reference} 
                  onChange={handleInputChange} 
                  className="border-gray-200 focus:border-loro-terracotta focus:ring-loro-terracotta/20"
                  placeholder="REF123456"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="source" className="text-loro-navy font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Source
                </Label>
                <Input 
                  id="source" 
                  name="source" 
                  value={formData.source} 
                  onChange={handleInputChange} 
                  className="border-gray-200 focus:border-loro-terracotta focus:ring-loro-terracotta/20"
                  placeholder="Site web, Portail, etc."
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message" className="text-loro-navy font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Message
              </Label>
              <Textarea 
                id="message" 
                name="message" 
                rows={4} 
                value={formData.message} 
                onChange={handleInputChange} 
                className="border-gray-200 focus:border-loro-terracotta focus:ring-loro-terracotta/20"
                placeholder="Message ou notes concernant ce lead..."
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-loro-terracotta hover:bg-loro-terracotta/90 text-white transition-colors py-6 text-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Importation en cours...
                </>
              ) : (
                "Importer le lead"
              )}
            </Button>
          </form>
        </TabsContent>
        
        <TabsContent value="email" className="focus-visible:outline-none">
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="emailContent" className="text-loro-navy font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contenu de l'email
              </Label>
              <Textarea 
                id="emailContent" 
                rows={12} 
                value={emailContent} 
                onChange={(e) => setEmailContent(e.target.value)} 
                placeholder="Collez ici le contenu complet de l'email..."
                className="font-mono text-sm border-gray-200 focus:border-loro-terracotta focus:ring-loro-terracotta/20"
                required 
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-loro-terracotta hover:bg-loro-terracotta/90 text-white transition-colors py-6 text-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyse et importation en cours...
                </>
              ) : (
                "Analyser et importer"
              )}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
      
      {result && (
        <Alert className="mt-6 bg-loro-white border-loro-terracotta/30">
          <AlertTitle className="text-loro-terracotta">Résultat de l'importation</AlertTitle>
          <AlertDescription>
            <p>{result.message}</p>
            {result.data && (
              <pre className="mt-4 bg-loro-white p-3 rounded text-xs overflow-auto border border-loro-sand/30">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default LeadImportForm;
