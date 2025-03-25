
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Flag, Phone, Home, Euro } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import FormInput from '@/components/leads/form/FormInput';
import { createLead } from '@/services/leadCore';
import { toast } from '@/hooks/use-toast';
import { LeadStatus } from "@/components/common/StatusBadge";
import { LeadTag } from "@/components/common/TagBadge";

interface MobileQuickImportProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MobileQuickImport: React.FC<MobileQuickImportProps> = ({ isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [leadName, setLeadName] = useState('Niharika Dolui');
  const [leadEmail, setLeadEmail] = useState('niharika@luxveda.com');
  const [leadPhone, setLeadPhone] = useState('+919547556987');
  const [propertyRef, setPropertyRef] = useState('85652319');
  const [propertyLocation, setPropertyLocation] = useState('Zante');
  const [propertyType, setPropertyType] = useState('Villa');
  const [propertyBedrooms, setPropertyBedrooms] = useState('5');
  const [budget, setBudget] = useState('950000');
  const [currency, setCurrency] = useState('EUR');
  const [nationality, setNationality] = useState('Inde');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImport = async () => {
    if (!leadName || !leadEmail) {
      toast({
        variant: "destructive",
        title: "Données manquantes",
        description: "Le nom et l'email sont requis."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newLeadData = {
        name: leadName,
        email: leadEmail,
        phone: leadPhone,
        status: "New" as LeadStatus,
        tags: ["Imported"] as LeadTag[],
        propertyReference: propertyRef,
        budget: budget ? `${budget} ${currency}` : "",
        desiredLocation: propertyLocation,
        propertyType: propertyType,
        bedrooms: propertyBedrooms ? parseInt(propertyBedrooms) : undefined,
        nationality: nationality,
        notes: `Villa d'Exception à Zakynthos – Un Écrin de Luxe et de Sérénité à 300 m de la Mer\nMaison · 6 Pièces · 5 Chambres · 375 m²\nLangue: anglais`,
        pipelineType: "purchase" as "purchase" | "rental",
        living_area: "375 m²"
      };

      const createdLead = await createLead(newLeadData);
      
      toast({
        title: "Lead créé",
        description: "Le lead a été créé avec succès."
      });

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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="w-[95%] max-w-md p-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-lg">Import Rapide de Lead</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Remplissez les informations pour créer un nouveau lead
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-2">
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
            label="Téléphone"
            name="phone"
            value={leadPhone}
            onChange={(e) => setLeadPhone(e.target.value)}
            icon={Phone}
          />
          
          <FormInput
            label="Référence"
            name="reference"
            value={propertyRef}
            onChange={(e) => setPropertyRef(e.target.value)}
          />
          
          <FormInput
            label="Localisation"
            name="location"
            value={propertyLocation}
            onChange={(e) => setPropertyLocation(e.target.value)}
            icon={Flag}
          />
          
          <FormInput
            label="Type de propriété"
            name="propertyType"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            icon={Home}
          />
          
          <FormInput
            label="Chambres"
            name="bedrooms"
            type="number"
            value={propertyBedrooms}
            onChange={(e) => setPropertyBedrooms(e.target.value)}
          />
          
          <div className="flex gap-2">
            <FormInput
              label="Budget"
              name="budget"
              type="text"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              icon={Euro}
              className="flex-1"
            />
            
            <FormInput
              label="Devise"
              name="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-24"
            />
          </div>
          
          <FormInput
            label="Nationalité"
            name="nationality"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            icon={Flag}
          />
        </div>
        
        <DialogFooter className="flex flex-row justify-between mt-4 gap-2 pt-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-1" /> 
            Annuler
          </Button>
          
          <Button 
            type="button" 
            onClick={handleImport}
            disabled={isSubmitting || !leadName || !leadEmail}
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-1" /> 
            Importer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MobileQuickImport;
