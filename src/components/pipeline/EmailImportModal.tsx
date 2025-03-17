
import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, X, AlertTriangle, Check, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { createLead } from '@/services/leadCore';
import { LeadDetailed, Country, PipelineType } from '@/types/lead';
import { supabase } from '@/integrations/supabase/client';
import { normalizePropertyType } from '@/components/chat/utils/propertyTypeUtils';
import { deriveNationalityFromCountry } from '@/components/chat/utils/nationalityUtils';
import { extractLefigaroPropertyDetails } from '@/components/chat/utils/emailParsingUtils';
import FormInput from '@/components/leads/form/FormInput';

interface EmailImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: Array<{id: string, name: string}>;
  onLeadCreated?: () => void;
}

const EmailImportModal: React.FC<EmailImportModalProps> = ({ 
  isOpen, 
  onClose, 
  teamMembers,
  onLeadCreated
}) => {
  const [emailContent, setEmailContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | undefined>(undefined);
  const [selectedPipeline, setSelectedPipeline] = useState<PipelineType>('purchase');
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<any>(null);

  useEffect(() => {
    // Auto-select Pierre Axel Gadait when the form is opened
    if (isOpen && teamMembers.length > 0) {
      const pierreAxel = teamMembers.find(member => 
        member.name.toLowerCase().includes('pierre axel gadait'));
      
      if (pierreAxel) {
        setSelectedAgent(pierreAxel.id);
      }
    }
  }, [isOpen, teamMembers]);

  const resetForm = () => {
    setEmailContent('');
    setExtractedData(null);
    setEditableData(null);
    setSelectedAgent(undefined);
    setIsEditing(false);
  };

  const handleExtractEmail = async () => {
    if (!emailContent.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez coller le contenu d'un email."
      });
      return;
    }

    setIsLoading(true);
    try {
      let propertyDetails = {};
      
      if (emailContent.includes('Propriétés Le Figaro')) {
        propertyDetails = extractLefigaroPropertyDetails(emailContent);
      }
      
      const { data, error } = await supabase.functions.invoke('chat-gadait', {
        body: { 
          type: 'email-extract', 
          content: emailContent,
          propertyDetails
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      try {
        const jsonData = JSON.parse(data.response);
        
        if (propertyDetails && Object.keys(propertyDetails).length > 0) {
          Object.keys(propertyDetails).forEach(key => {
            if (propertyDetails[key] && !jsonData[key]) {
              jsonData[key] = propertyDetails[key];
            }
          });
        }
        
        if (jsonData.propertyType || jsonData.property_type) {
          jsonData.propertyType = normalizePropertyType(jsonData.propertyType || jsonData.property_type);
        }
        
        if (jsonData.country && !jsonData.nationality) {
          jsonData.nationality = deriveNationalityFromCountry(jsonData.country);
        }
        
        setExtractedData(jsonData);
        setEditableData(jsonData);
        
        toast({
          title: "Données extraites",
          description: "Les informations ont été extraites avec succès."
        });
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        setExtractedData({ raw: data.response });
        setEditableData({ raw: data.response });
        toast({
          variant: "destructive",
          title: "Format incorrect",
          description: "Les données n'ont pas pu être traitées correctement."
        });
      }
    } catch (error) {
      console.error('Error extracting email data:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'extraire les données de l'email."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLead = async () => {
    if (!editableData) return;
    
    if (!selectedAgent) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un commercial à qui assigner ce lead."
      });
      return;
    }
    
    try {
      // Normalize country to ensure it's a valid Country type
      let country: Country | undefined = undefined;
      if (editableData.country) {
        // Check if the country matches one of our Country types
        const formattedCountry = editableData.country as string;
        const isValidCountry = ['France', 'Spain', 'Portugal', 'Greece', 'Switzerland', 
                               'United Kingdom', 'United States', 'Croatia', 'Mauritius', 
                               'Seychelles', 'Maldives', 'United Arab Emirates'].includes(formattedCountry);
        
        if (isValidCountry) {
          country = formattedCountry as Country;
        }
      }
      
      // Extract any potential reference or external id
      const propertyReference = editableData.property_reference || 
                              editableData.propertyReference || 
                              editableData.reference ||
                              editableData["Property reference"] || "";
      
      const external_id = editableData.external_id || 
                         editableData.externalId || 
                         editableData["external id"] || "";
      
      const newLead: Omit<LeadDetailed, "id" | "createdAt"> = {
        name: editableData.name || editableData.Name || "",
        email: editableData.email || editableData.Email || "",
        phone: editableData.phone || editableData.Phone || "",
        source: editableData.Source || editableData.source || "Site web",
        budget: editableData.Budget || editableData.budget || "",
        propertyReference,
        external_id,
        desiredLocation: editableData.desired_location || editableData.desiredLocation || editableData["Desired location"] || "",
        propertyType: editableData.propertyType || editableData.property_type || editableData["Property type"] || "",
        nationality: editableData.nationality || "",
        notes: emailContent || "",
        status: "New",
        tags: ["Imported"],
        assignedTo: selectedAgent,
        bedrooms: editableData.bedrooms || undefined,
        url: editableData.url || "",
        taskType: "Call",
        country,
        pipelineType: selectedPipeline // <-- Make sure this is set correctly
      };
      
      console.log("Creating lead with pipeline type:", selectedPipeline);
      console.log("Creating lead with data:", newLead);
      
      const createdLead = await createLead(newLead);
      console.log("Created lead:", createdLead);
      
      toast({
        title: "Lead créé",
        description: `Le lead ${newLead.name} a été créé avec succès dans le pipeline ${selectedPipeline === 'purchase' ? 'achat' : 'location'}.`
      });
      
      resetForm();
      onClose();
      
      if (onLeadCreated) {
        onLeadCreated();
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le lead."
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditableData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const groupedData = React.useMemo(() => {
    if (!extractedData) return null;
    
    return {
      contact: {
        name: extractedData.name || extractedData.Name,
        email: extractedData.email || extractedData.Email,
        phone: extractedData.phone || extractedData.Phone,
        country: extractedData.country || extractedData.Country,
        nationality: extractedData.nationality,
      },
      property: {
        propertyType: extractedData.propertyType || extractedData.property_type || extractedData["Property type"],
        desiredLocation: extractedData.desiredLocation || extractedData.desired_location || extractedData["Desired location"],
        budget: extractedData.budget || extractedData.Budget,
        propertyReference: extractedData.propertyReference || extractedData.reference || extractedData.property_reference || extractedData["Property reference"],
        bedrooms: extractedData.bedrooms || extractedData.Bedrooms,
        url: extractedData.url || extractedData.Url || extractedData["URL"],
      },
      source: {
        source: extractedData.source || extractedData.Source || "Le Figaro",
      },
      other: Object.entries(extractedData)
        .filter(([key]) => 
          !['name', 'Name', 'email', 'Email', 'phone', 'Phone', 'country', 'Country', 'nationality',
            'propertyType', 'property_type', 'Property type', 
            'desiredLocation', 'desired_location', 'Desired location',
            'budget', 'Budget', 
            'propertyReference', 'reference', 'property_reference', 'Property reference',
            'bedrooms', 'Bedrooms',
            'url', 'Url', 'URL',
            'source', 'Source'].includes(key)
        )
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as Record<string, any>)
    };
  }, [extractedData]);

  const renderField = (key: string, value: any, label: string) => {
    if (!value) return null;
    
    if (isEditing) {
      return (
        <div key={key} className="mb-2">
          <FormInput
            label={label}
            name={key}
            value={String(editableData?.[key] ?? value)}
            onChange={handleInputChange}
            className="text-sm"
          />
        </div>
      );
    } else {
      return (
        <div key={key} className="flex justify-between border-b border-loro-sand/30 pb-1">
          <span className="font-medium capitalize">{label}:</span>
          <span className="text-muted-foreground">{String(value)}</span>
        </div>
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Importer un lead depuis un email
          </DialogTitle>
          <DialogDescription>
            Collez le contenu d'un email pour extraire automatiquement les informations du lead.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto pr-4">
          <div className="space-y-4">
            {!extractedData ? (
              <div>
                <Textarea
                  placeholder="Collez le contenu de l'email ici..."
                  className="min-h-[200px] resize-none"
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                />
                <Button 
                  className="mt-2 w-full bg-loro-navy hover:bg-loro-navy/90" 
                  onClick={handleExtractEmail}
                  disabled={isLoading || !emailContent.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Extraction en cours...
                    </>
                  ) : (
                    'Extraire les informations'
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {!isEditing && (
                  <Button
                    variant="outline"
                    className="mb-2 flex items-center gap-1"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="h-4 w-4" />
                    Modifier les informations
                  </Button>
                )}
                
                {isEditing && (
                  <Button
                    variant="outline"
                    className="mb-2"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    Terminer la modification
                  </Button>
                )}
                
                {isEditing ? (
                  <div className="space-y-6">
                    <div className="border rounded-md p-3">
                      <h3 className="font-medium text-sm mb-2">Informations de contact</h3>
                      <div className="space-y-2">
                        {editableData && Object.entries({
                          name: editableData.name || editableData.Name || "",
                          email: editableData.email || editableData.Email || "",
                          phone: editableData.phone || editableData.Phone || "",
                          country: editableData.country || editableData.Country || "",
                          nationality: editableData.nationality || ""
                        }).map(([key, value]) => {
                          if (!value) return null;
                          const label = key === 'name' ? 'Nom' : 
                                      key === 'email' ? 'Email' : 
                                      key === 'phone' ? 'Téléphone' : 
                                      key === 'country' ? 'Pays' : 
                                      key === 'nationality' ? 'Nationalité' : key;
                          return renderField(key, value, label);
                        })}
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <h3 className="font-medium text-sm mb-2">Informations sur la propriété</h3>
                      <div className="space-y-2">
                        {editableData && Object.entries({
                          propertyType: editableData.propertyType || editableData.property_type || "",
                          desiredLocation: editableData.desiredLocation || editableData.desired_location || "",
                          budget: editableData.budget || editableData.Budget || "",
                          propertyReference: editableData.propertyReference || editableData.reference || editableData.property_reference || "",
                          bedrooms: editableData.bedrooms || "",
                          url: editableData.url || ""
                        }).map(([key, value]) => {
                          if (!value) return null;
                          const label = key === 'propertyType' ? 'Type de bien' :
                                       key === 'desiredLocation' ? 'Emplacement désiré' :
                                       key === 'budget' ? 'Budget' :
                                       key === 'propertyReference' ? 'Référence' :
                                       key === 'bedrooms' ? 'Chambres' :
                                       key === 'url' ? 'URL de l\'annonce' : key;
                          return renderField(key, value, label);
                        })}
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <h3 className="font-medium text-sm mb-2">Source</h3>
                      <div className="space-y-2">
                        {editableData && renderField('source', editableData.source || editableData.Source || "Le Figaro", 'Source')}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {groupedData?.contact && (
                      <div className="border rounded-md p-3">
                        <h3 className="font-medium text-sm mb-2">Informations de contact</h3>
                        <div className="space-y-1 text-sm">
                          {Object.entries(groupedData.contact).map(([key, value]) => 
                            value && (
                              <div key={key} className="flex justify-between border-b border-loro-sand/30 pb-1">
                                <span className="font-medium capitalize">{key === 'name' ? 'Nom' : 
                                                                        key === 'email' ? 'Email' : 
                                                                        key === 'phone' ? 'Téléphone' : 
                                                                        key === 'country' ? 'Pays' : 
                                                                        key === 'nationality' ? 'Nationalité' : 
                                                                        key}:</span>
                                <span className="text-muted-foreground">{String(value)}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                    
                    {groupedData?.property && (
                      <div className="border rounded-md p-3">
                        <h3 className="font-medium text-sm mb-2">Informations sur la propriété</h3>
                        <div className="space-y-1 text-sm">
                          {Object.entries(groupedData.property).map(([key, value]) => 
                            value && (
                              <div key={key} className="flex justify-between border-b border-loro-sand/30 pb-1">
                                <span className="font-medium capitalize">{key === 'propertyType' ? 'Type de bien' :
                                                                      key === 'desiredLocation' ? 'Emplacement désiré' :
                                                                      key === 'budget' ? 'Budget' :
                                                                      key === 'propertyReference' ? 'Référence' :
                                                                      key === 'bedrooms' ? 'Chambres' :
                                                                      key === 'url' ? 'URL de l\'annonce' :
                                                                      key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                <span className="text-muted-foreground">{String(value)}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                    
                    {groupedData?.source && Object.keys(groupedData.source).some(key => groupedData.source[key]) && (
                      <div className="border rounded-md p-3">
                        <h3 className="font-medium text-sm mb-2">Source</h3>
                        <div className="space-y-1 text-sm">
                          {Object.entries(groupedData.source).map(([key, value]) => 
                            value && (
                              <div key={key} className="flex justify-between border-b border-loro-sand/30 pb-1">
                                <span className="font-medium capitalize">{key}:</span>
                                <span className="text-muted-foreground">{String(value)}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                    
                    {groupedData?.other && Object.keys(groupedData.other).length > 0 && (
                      <div className="border rounded-md p-3">
                        <h3 className="font-medium text-sm mb-2">Autres informations</h3>
                        <div className="space-y-1 text-sm">
                          {Object.entries(groupedData.other).map(([key, value]) => 
                            value && (
                              <div key={key} className="flex justify-between border-b border-loro-sand/30 pb-1">
                                <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                                <span className="text-muted-foreground">{String(value)}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                <Separator />
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Action requise</AlertTitle>
                  <AlertDescription>
                    Veuillez sélectionner un commercial pour créer le lead dans le CRM
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Pipeline</h3>
                    <div className="flex space-x-4">
                      <Button
                        variant={selectedPipeline === 'purchase' ? 'default' : 'outline'}
                        onClick={() => setSelectedPipeline('purchase')}
                        className="flex-1"
                      >
                        Achat
                      </Button>
                      <Button
                        variant={selectedPipeline === 'rental' ? 'default' : 'outline'}
                        onClick={() => setSelectedPipeline('rental')}
                        className="flex-1"
                      >
                        Location
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Commercial assigné <span className="text-red-500">*</span></h3>
                    <Select 
                      value={selectedAgent} 
                      onValueChange={setSelectedAgent}
                    >
                      <SelectTrigger className={`w-full ${!selectedAgent ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Sélectionner un commercial" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map(member => (
                          <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!selectedAgent && (
                      <p className="text-xs text-red-500 mt-1">La sélection d'un commercial est obligatoire</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {extractedData && (
          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setExtractedData(null)}
            >
              <X className="h-4 w-4 mr-2" />
              Modifier l'email
            </Button>
            <Button 
              type="button"
              className="bg-loro-navy hover:bg-loro-navy/90"
              onClick={handleCreateLead}
              disabled={!selectedAgent}
            >
              <Check className="h-4 w-4 mr-2" />
              Créer le lead
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmailImportModal;
