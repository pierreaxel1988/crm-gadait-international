
import React from 'react';
import { Button } from '@/components/ui/button';
import TeamMemberSelect from '@/components/leads/TeamMemberSelect';
import { ExtractedData } from './types/chatTypes';

interface ExtractedLeadFormProps {
  extractedData: ExtractedData;
  selectedAgent: string | undefined;
  setSelectedAgent: (value: string | undefined) => void;
  onCancel: () => void;
  onImport: () => void;
}

const ExtractedLeadForm: React.FC<ExtractedLeadFormProps> = ({
  extractedData,
  selectedAgent,
  setSelectedAgent,
  onCancel,
  onImport
}) => {
  return (
    <div className="mb-4 p-3 bg-loro-pearl/30 rounded-md">
      <h3 className="font-medium text-loro-navy mb-2">Données du lead extraites</h3>
      <div className="space-y-2 text-sm mb-3">
        <p><span className="font-medium">Nom:</span> {extractedData.name}</p>
        <p><span className="font-medium">Email:</span> {extractedData.email}</p>
        <p><span className="font-medium">Téléphone:</span> {extractedData.phone}</p>
        <p><span className="font-medium">Budget:</span> {extractedData.budget}</p>
        <p><span className="font-medium">Localisation:</span> {extractedData.desiredLocation}</p>
        <p><span className="font-medium">Type de propriété:</span> {extractedData.propertyType}</p>
        <p><span className="font-medium">Référence:</span> {extractedData.reference}</p>
      </div>
      
      <div className="mb-3">
        <TeamMemberSelect
          value={selectedAgent}
          onChange={setSelectedAgent}
          label="Attribuer à un commercial"
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onCancel}
        >
          Annuler
        </Button>
        <Button 
          size="sm" 
          onClick={onImport}
          className="bg-loro-navy hover:bg-loro-navy/90"
        >
          Importer le lead
        </Button>
      </div>
    </div>
  );
};

export default ExtractedLeadForm;
