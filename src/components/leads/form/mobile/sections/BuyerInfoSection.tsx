
import React from 'react';
import { LeadDetailed } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface BuyerInfoSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const BuyerInfoSection = ({ lead, onDataChange }: BuyerInfoSectionProps) => {
  // This is a simplified version for mobile that simply delegates to the main component

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onDataChange({ [name]: value });
  };

  return (
    <div className="space-y-4">
      {/* Nationality */}
      <div className="space-y-2">
        <Label htmlFor="nationality" className="text-sm font-medium">Nationalité</Label>
        <Input
          id="nationality"
          name="nationality"
          value={lead.nationality || ''}
          onChange={handleInputChange}
          placeholder="Nationalité de l'acheteur"
          className="w-full"
        />
      </div>

      {/* Preferred language */}
      <div className="space-y-2">
        <Label htmlFor="preferredLanguage" className="text-sm font-medium">Langue préférée</Label>
        <Input
          id="preferredLanguage"
          name="preferredLanguage"
          value={lead.preferredLanguage || ''}
          onChange={handleInputChange}
          placeholder="Langue préférée pour la communication"
          className="w-full"
        />
      </div>

      {/* Tax residence */}
      <div className="space-y-2">
        <Label htmlFor="taxResidence" className="text-sm font-medium">Résidence fiscale</Label>
        <Input
          id="taxResidence"
          name="taxResidence"
          value={lead.taxResidence || ''}
          onChange={handleInputChange}
          placeholder="Pays de résidence fiscale"
          className="w-full"
        />
      </div>
    </div>
  );
};

export default BuyerInfoSection;
