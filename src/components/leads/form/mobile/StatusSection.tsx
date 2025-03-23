import React from 'react';
import { LeadDetailed, LeadTag } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MultiSelectButtons from '@/components/leads/form/MultiSelectButtons';
import TeamMemberSelect from '@/components/leads/TeamMemberSelect';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { LeadStatus } from '@/components/common/StatusBadge';

interface StatusSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const StatusSection: React.FC<StatusSectionProps> = ({ lead, onDataChange }) => {
  const handleInputChange = (field: keyof LeadDetailed, value: any) => {
    onDataChange({ [field]: value } as Partial<LeadDetailed>);
  };
  
  // Standardized statuses matching the database values
  const leadStatuses: LeadStatus[] = [
    "New",       // Nouveaux
    "Contacted", // Contactés
    "Qualified", // Qualifiés
    "Proposal",  // Propositions
    "Visit",     // Visites en cours
    "Offer",     // Offre en cours (English)
    "Offre",     // Offre en cours (French)
    "Deposit",   // Dépôt reçu
    "Signed",    // Signature finale
    "Gagné",     // Conclus
    "Perdu"      // Perdu
  ];
  
  const leadTags: LeadTag[] = ["Vip", "Hot", "Serious", "Cold", "No response", "No phone", "Fake"];

  const handleTagToggle = (tag: LeadTag) => {
    const currentTags = lead.tags || [];
    const updatedTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    handleInputChange('tags', updatedTags);
  };

  // Format dates for display, if they exist
  const formattedLastContact = lead.lastContactedAt 
    ? format(new Date(lead.lastContactedAt), 'dd/MM/yyyy HH:mm')
    : '';
    
  const formattedNextFollowUp = lead.nextFollowUpDate 
    ? format(new Date(lead.nextFollowUpDate), 'dd/MM/yyyy HH:mm')
    : '';

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-medium text-loro-navy mb-4">Statut & Suivi</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm">Statut du lead</Label>
          <Select
            value={lead.status}
            onValueChange={(value) => handleInputChange('status', value)}
          >
            <SelectTrigger id="status" className="w-full font-futura">
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              {leadStatuses.map((status) => (
                <SelectItem key={status} value={status} className="font-futura">
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm">Tags</Label>
          <MultiSelectButtons
            options={leadTags}
            selectedValues={lead.tags || []}
            onToggle={handleTagToggle}
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm">Responsable du suivi</Label>
          <TeamMemberSelect
            value={lead.assignedTo}
            onChange={(value) => handleInputChange('assignedTo', value)}
            label="Attribuer à"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastContactedAt" className="text-sm">Date du dernier contact</Label>
          <Input
            id="lastContactedAt"
            value={formattedLastContact}
            className="w-full font-futura bg-gray-50"
            readOnly
          />
          <p className="text-xs text-muted-foreground">Mise à jour automatique lors d'une action</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="nextFollowUpDate" className="text-sm">Prochain suivi prévu</Label>
          <Input
            id="nextFollowUpDate"
            value={formattedNextFollowUp}
            className="w-full font-futura bg-gray-50"
            readOnly
          />
          <p className="text-xs text-muted-foreground">Programmé automatiquement lors de la création d'une action</p>
        </div>
      </div>
    </div>
  );
};

export default StatusSection;
