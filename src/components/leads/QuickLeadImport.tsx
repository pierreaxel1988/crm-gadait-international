
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import FormInput from './form/FormInput';
import { createLead } from '@/services/leadCore';
import { toast } from '@/hooks/use-toast';
import { LeadStatus } from "@/components/common/StatusBadge";
import { LeadTag } from "@/components/common/TagBadge";
import { usePropertyExtraction } from '@/components/chat/hooks/usePropertyExtraction';

interface QuickLeadImportProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const QuickLeadImport: React.FC<QuickLeadImportProps> = ({ isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadCountry, setLeadCountry] = useState('');
  const {
    propertyUrl,
    setPropertyUrl,
    isLoading,
    extractedData,
    extractPropertyData,
    resetExtraction
  } = usePropertyExtraction();

  const handleExtractUrl = () => {
    if (propertyUrl) {
      extractPropertyData();
    } else {
      toast({
        variant: "destructive",
        title: "URL manquante",
        description: "Veuillez entrer l'URL de la propriété."
      });
    }
  };

  const handleImport = async () => {
    if (!leadName || !leadEmail) {
      toast({
        variant: "destructive",
        title: "Données manquantes",
        description: "Le nom et l'email sont requis."
      });
      return;
    }

    try {
      // Préparer les données du lead
      const newLeadData = {
        name: leadName,
        email: leadEmail,
        phone: "",
        status: "New" as LeadStatus,
        tags: ["Imported"] as LeadTag[],
        propertyReference: extractedData?.reference || "",
        budget: extractedData?.price || "",
        desiredLocation: extractedData?.location || "",
        propertyType: extractedData?.propertyType || "",
        bedrooms: extractedData?.bedrooms ? parseInt(extractedData.bedrooms.toString()) : undefined,
        nationality: "",
        country: leadCountry,
        notes: `Intéressé par l'annonce: ${propertyUrl}`,
        url: propertyUrl,
        pipelineType: "purchase" as "purchase" | "rental"
      };

      // Créer le lead
      const createdLead = await createLead(newLeadData);
      
      toast({
        title: "Lead créé",
        description: "Un nouveau lead a été créé avec les informations fournies."
      });

      // Réinitialiser le formulaire
      setLeadName('');
      setLeadEmail('');
      setLeadCountry('');
      setPropertyUrl('');
      resetExtraction();
      
      // Fermer la modal
      onClose();
      
      // Callback de succès (rafraîchir la liste)
      if (onSuccess) onSuccess();
      
      // Rediriger vers la page d'édition du lead
      navigate(`/leads/${createdLead.id}`);
    } catch (error) {
      console.error('Erreur lors de la création du lead:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le lead."
      });
    }
  };

  const handleCancel = () => {
    // Réinitialiser le formulaire
    setLeadName('');
    setLeadEmail('');
    setLeadCountry('');
    setPropertyUrl('');
    resetExtraction();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Rapide de Lead</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <FormInput
            label="Nom"
            name="name"
            value={leadName}
            onChange={(e) => setLeadName(e.target.value)}
            required
          />
          
          <FormInput
            label="Email"
            name="email"
            type="email"
            value={leadEmail}
            onChange={(e) => setLeadEmail(e.target.value)}
            required
          />
          
          <FormInput
            label="Pays"
            name="country"
            value={leadCountry}
            onChange={(e) => setLeadCountry(e.target.value)}
          />
          
          <div className="space-y-2">
            <FormInput
              label="URL de la propriété"
              name="url"
              value={propertyUrl}
              onChange={(e) => setPropertyUrl(e.target.value)}
              icon={ExternalLink}
            />
            
            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleExtractUrl}
                disabled={isLoading || !propertyUrl}
                className="text-xs"
              >
                {isLoading ? "Extraction..." : "Extraire les données"}
              </Button>
            </div>
          </div>
          
          {extractedData && (
            <div className="border border-gray-200 rounded-md p-3 mt-2 text-sm space-y-1">
              <h4 className="font-semibold mb-2">Données extraites:</h4>
              {extractedData.title && <p><span className="font-medium">Titre:</span> {extractedData.title}</p>}
              {extractedData.price && <p><span className="font-medium">Prix:</span> {extractedData.price}</p>}
              {extractedData.location && <p><span className="font-medium">Localisation:</span> {extractedData.location}</p>}
              {extractedData.propertyType && <p><span className="font-medium">Type:</span> {extractedData.propertyType}</p>}
              {extractedData.bedrooms && <p><span className="font-medium">Chambres:</span> {extractedData.bedrooms}</p>}
              {extractedData.reference && <p><span className="font-medium">Référence:</span> {extractedData.reference}</p>}
            </div>
          )}
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button 
            type="button" 
            variant="outline"
            onClick={handleCancel}
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4" /> 
            Annuler
          </Button>
          
          <Button 
            type="button" 
            onClick={handleImport}
            disabled={!leadName || !leadEmail}
            className="flex items-center gap-1"
          >
            <Check className="h-4 w-4" /> 
            Importer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuickLeadImport;
