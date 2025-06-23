
import React, { useState, useEffect } from 'react';
import { LeadDetailed, LeadStatus } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { LeadTag } from '@/components/common/TagBadge';
import TeamMemberSelect from '@/components/leads/TeamMemberSelect';
import { format } from 'date-fns';

const STATUS_OPTIONS: LeadStatus[] = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal',
  'Visit',
  'Offre',
  'Deposit',
  'Signed',
  'Gagné',
  'Perdu'
];

const TAG_OPTIONS: LeadTag[] = [
  "Vip", 
  "Hot", 
  "Serious", 
  "Cold", 
  "No response", 
  "No phone", 
  "Fake"
];

interface StatusSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

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

  const handleTagToggle = (tag: LeadTag) => {
    const updatedTags = lead.tags?.includes(tag)
      ? lead.tags.filter(t => t !== tag)
      : [...(lead.tags || []), tag];
    
    handleInputChange('tags', updatedTags);
  };

  const dynamicTopMargin = isHeaderMeasured 
    ? `${Math.max(headerHeight + 8, 32)}px` 
    : 'calc(32px + 4rem)';

  const formattedLastContact = lead.lastContactedAt 
    ? format(new Date(lead.lastContactedAt), 'dd/MM/yyyy HH:mm')
    : '';
    
  const formattedNextFollowUp = lead.nextFollowUpDate 
    ? format(new Date(lead.nextFollowUpDate), 'dd/MM/yyyy HH:mm')
    : '';

  return (
    <div 
      className="space-y-5 pt-4" 
      style={{ marginTop: dynamicTopMargin }}
    >
      <h2 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b mb-6">Statut et Suivi</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm">Statut</Label>
          <Select 
            value={lead.status || ''} 
            onValueChange={(value) => handleInputChange('status', value as LeadStatus)}
          >
            <SelectTrigger id="status" className="w-full font-futura">
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(status => (
                <SelectItem key={status} value={status} className="font-futura">
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Tags</Label>
          <div className="flex flex-wrap gap-2">
            {TAG_OPTIONS.map(tag => (
              <Button
                key={tag}
                variant={lead.tags?.includes(tag) ? "default" : "outline"}
                size="sm"
                onClick={() => handleTagToggle(tag)}
                className="font-futura text-xs"
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Responsable du suivi</Label>
          <TeamMemberSelect
            value={lead.assignedTo}
            onChange={(value) => handleInputChange('assignedTo', value || '')}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Date du dernier contact</Label>
          <Input
            value={formattedLastContact}
            disabled
            className="font-futura bg-gray-50"
            placeholder="Mise à jour automatique lors d'une action"
          />
          <p className="text-xs text-muted-foreground">
            Mise à jour automatique lors d'une action
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Prochain suivi prévu</Label>
          <Input
            value={formattedNextFollowUp}
            disabled
            className="font-futura bg-gray-50"
            placeholder="Programmé automatiquement lors de la création d'une action"
          />
          <p className="text-xs text-muted-foreground">
            Programmé automatiquement lors de la création d'une action
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatusSection;
