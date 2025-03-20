
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, ExternalLink, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import FormInput from './form/FormInput';
import { createLead } from '@/services/leadCore';
import { toast } from '@/hooks/use-toast';
import { LeadStatus } from "@/components/common/StatusBadge";
import { LeadTag } from "@/components/common/TagBadge";
import { usePropertyExtraction } from '@/components/chat/hooks/usePropertyExtraction';
import { Country } from '@/types/lead';
import { LOCATIONS_BY_COUNTRY } from '@/utils/locationsByCountry';
import { deriveNationalityFromCountry } from '@/components/chat/utils/nationalityUtils';

interface QuickLeadImportProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const QuickLeadImport: React.FC<QuickLeadImportProps> = ({ isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadCountry, setLeadCountry] = useState<Country | ''>('');
  const [leadNationality, setLeadNationality] = useState('');
  
  const {
    propertyUrl,
    setPropertyUrl,
    isLoading,
    extractedData,
    extractPropertyData,
    resetExtraction
  } = usePropertyExtraction();

  // Get available countries list
  const availableCountries = Object.keys(LOCATIONS_BY_COUNTRY) as Country[];
  
  // Get country flag emoji
  const getCountryFlag = (country: string): string => {
    const countryToFlag: Record<string, string> = {
      'Croatia': '🇭🇷',
      'France': '🇫🇷',
      'Greece': '🇬🇷',
      'Maldives': '🇲🇻',
      'Mauritius': '🇲🇺',
      'Portugal': '🇵🇹',
      'Seychelles': '🇸🇨',
      'Spain': '🇪🇸',
      'Switzerland': '🇨🇭',
      'United Arab Emirates': '🇦🇪',
      'United Kingdom': '🇬🇧',
      'United States': '🇺🇸'
    };
    
    return countryToFlag[country] || '';
  };
  
  // Update nationality when country changes
  useEffect(() => {
    if (leadCountry && !leadNationality) {
      const nationality = deriveNationalityFromCountry(leadCountry);
      if (nationality) {
        setLeadNationality(nationality);
      }
    }
  }, [leadCountry, leadNationality]);

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
        nationality: leadNationality,
        country: (leadCountry as Country) || undefined,
        notes: `Intéressé par l'annonce: ${propertyUrl}`,
        url: propertyUrl,
        pipelineType: "purchase" as "purchase" | "rental"
      };

      const createdLead = await createLead(newLeadData);
      
      toast({
        title: "Lead créé",
        description: "Un nouveau lead a été créé avec les informations fournies."
      });

      setLeadName('');
      setLeadEmail('');
      setLeadCountry('');
      setLeadNationality('');
      setPropertyUrl('');
      resetExtraction();
      
      onClose();
      
      if (onSuccess) onSuccess();
      
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
    setLeadName('');
    setLeadEmail('');
    setLeadCountry('');
    setLeadNationality('');
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
            type="select"
            value={leadCountry}
            onChange={(e) => setLeadCountry(e.target.value as Country)}
            icon={Flag}
            options={availableCountries.map(country => ({ 
              value: country, 
              label: `${getCountryFlag(country)} ${country}` 
            }))}
            placeholder="Sélectionner un pays d'origine"
          />
          
          <FormInput
            label="Nationalité"
            name="nationality"
            value={leadNationality}
            onChange={(e) => setLeadNationality(e.target.value)}
            placeholder="Nationalité du client"
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
