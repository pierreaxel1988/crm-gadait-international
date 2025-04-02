
import React, { useState, useEffect } from 'react';
import { LeadDetailed, LeadTag } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import MultiSelectButtons from '@/components/leads/form/MultiSelectButtons';
import TeamMemberSelect from '@/components/leads/TeamMemberSelect';

interface StatusSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const LEAD_STATUSES = [
  "New", "Contacted", "Qualified", "Proposal", "Visit", 
  "Offer", "Offre", "Deposit", "Signed", "Gagné", "Perdu"
];

const LEAD_TAGS = ["Vip", "Hot", "Serious", "Cold", "No response", "No phone", "Fake"];

const StatusSection: React.FC<StatusSectionProps> = ({
  lead,
  onDataChange
}) => {
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [isHeaderMeasured, setIsHeaderMeasured] = useState(false);
  
  useEffect(() => {
    const measureHeader = () => {
      const headerElement = document.querySelector('.bg-loro-sand');
      if (headerElement) {
        const height = headerElement.getBoundingClientRect().height;
        setHeaderHeight(height);
        setIsHeaderMeasured(true);
      }
    };
    
    measureHeader();
    window.addEventListener('resize', measureHeader);
    const timeoutId = setTimeout(measureHeader, 300);
    
    return () => {
      window.removeEventListener('resize', measureHeader);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleInputChange = (field: keyof LeadDetailed, value: any) => {
    onDataChange({
      [field]: value
    } as Partial<LeadDetailed>);
  };

  const handleTagToggle = (tag: string) => {
    const updatedTags = lead.tags?.includes(tag as LeadTag)
      ? lead.tags.filter(t => t !== tag)
      : [...(lead.tags || []), tag as LeadTag];
    
    handleInputChange('tags', updatedTags);
  };

  const dynamicTopMargin = isHeaderMeasured 
    ? `${Math.max(headerHeight + 8, 32)}px` 
    : 'calc(32px + 4rem)';

  return (
    <div 
      className="space-y-5 pt-4" 
      style={{ marginTop: dynamicTopMargin }}
    >
      <h2 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b mb-4">Statut et Suivi</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm">Statut du lead</Label>
          <div className="flex">
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 border border-r-0 rounded-l-md bg-white">
              <Activity className="h-4 w-4 text-gray-500" />
            </div>
            <Select 
              value={lead.status || ''} 
              onValueChange={value => handleInputChange('status', value)}
            >
              <SelectTrigger id="status" className="w-full rounded-l-none font-futura">
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                {LEAD_STATUSES.map(status => (
                  <SelectItem key={status} value={status} className="font-futura">
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm">Tags</Label>
          <MultiSelectButtons
            options={LEAD_TAGS}
            selectedValues={lead.tags || []}
            onToggle={handleTagToggle}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="assignedTo" className="text-sm">Responsable du suivi</Label>
          <TeamMemberSelect
            value={lead.assignedTo}
            onChange={(value) => handleInputChange('assignedTo', value)}
            label=""
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm">Dernière interaction</Label>
          <div className="p-3 bg-gray-50 rounded-md border text-sm text-gray-700">
            {lead.lastContactedAt 
              ? new Date(lead.lastContactedAt).toLocaleDateString('fr-FR', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })
              : 'Aucune interaction enregistrée'}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm">Objectif client</Label>
          <RadioGroup 
            value={lead.propertyUse || ''} 
            onValueChange={value => handleInputChange('propertyUse', value)}
            className="flex flex-col space-y-1.5"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Résidence principale" id="residence" />
              <Label htmlFor="residence" className="font-futura">Résidence principale</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Investissement locatif" id="investment" />
              <Label htmlFor="investment" className="font-futura">Investissement locatif</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};

export default StatusSection;
