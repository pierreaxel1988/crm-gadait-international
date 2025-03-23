
import React from 'react';
import { LeadDetailed, LeadSource } from '@/types/lead';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

const LEAD_SOURCES: LeadSource[] = [
  'Site web', 'Réseaux sociaux', 'Portails immobiliers', 'Network', 
  'Repeaters', 'Recommandations', 'Apporteur d\'affaire', 'Idealista',
  'Le Figaro', 'Properstar', 'Property Cloud', 'L\'express Property'
];

interface GeneralInfoSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({ lead, onDataChange }) => {
  const handleInputChange = (field: keyof LeadDetailed, value: string) => {
    onDataChange({ [field]: value } as Partial<LeadDetailed>);
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-medium text-loro-navy mb-4">Informations Générales</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="salutation" className="text-sm">Civilité</Label>
          <Select
            value={lead.salutation || ''}
            onValueChange={(value) => handleInputChange('salutation', value)}
          >
            <SelectTrigger id="salutation" className="w-full font-futura">
              <SelectValue placeholder="Sélectionner une civilité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M." className="font-futura">M.</SelectItem>
              <SelectItem value="Mme" className="font-futura">Mme</SelectItem>
            </SelectContent>
          </Select>
        </div>
      
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm">Nom complet</Label>
          <Input
            id="name"
            value={lead.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Nom complet"
            className="w-full font-futura"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm">Adresse e-mail</Label>
          <Input
            id="email"
            value={lead.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Adresse e-mail"
            className="w-full font-futura"
            type="email"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm">Numéro de téléphone</Label>
          <Input
            id="phone"
            value={lead.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Numéro de téléphone"
            className="w-full font-futura"
            type="tel"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="source" className="text-sm">Source du lead</Label>
          <Select
            value={lead.source || ''}
            onValueChange={(value) => handleInputChange('source', value)}
          >
            <SelectTrigger id="source" className="w-full font-futura">
              <SelectValue placeholder="Sélectionner une source" />
            </SelectTrigger>
            <SelectContent searchable={true}>
              {LEAD_SOURCES.map((source) => (
                <SelectItem key={source} value={source} className="font-futura">
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="propertyReference" className="text-sm">Référence du bien</Label>
          <Input
            id="propertyReference"
            value={lead.propertyReference || ''}
            onChange={(e) => handleInputChange('propertyReference', e.target.value)}
            placeholder="Référence du bien"
            className="w-full font-futura"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="createdAt" className="text-sm">Date d'entrée du lead</Label>
          <Input
            id="createdAt"
            value={lead.createdAt ? format(new Date(lead.createdAt), 'dd/MM/yyyy') : ''}
            className="w-full font-futura bg-gray-50"
            readOnly
          />
        </div>
      </div>
    </div>
  );
};

export default GeneralInfoSection;
