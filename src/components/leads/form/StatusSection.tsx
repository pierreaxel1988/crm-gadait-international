
import React from 'react';
import { CalendarClock, CalendarDays, Activity, Home } from 'lucide-react';
import { LeadDetailed, LeadSource, PipelineType } from '@/types/lead';
import { LeadStatus } from '@/components/common/StatusBadge';
import { LeadTag } from '@/components/common/TagBadge';
import FormSection from './FormSection';
import FormInput from './FormInput';
import MultiSelectButtons from './MultiSelectButtons';
import TeamMemberSelect from '@/components/leads/TeamMemberSelect';
import { format } from 'date-fns';
import RadioSelectButtons from './RadioSelectButtons';
import { toast } from '@/hooks/use-toast';

interface StatusSectionProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleTagToggle?: (tag: LeadTag) => void;
  leadStatuses?: LeadStatus[];
  leadTags?: LeadTag[];
  sources?: LeadSource[];
}

// Define specific status sets for different pipeline types
const PURCHASE_STATUSES: LeadStatus[] = [
  "New", "Contacted", "Qualified", "Proposal", "Visit", 
  "Offer", "Offre", "Deposit", "Signed", "Gagné", "Perdu"
];

const RENTAL_STATUSES: LeadStatus[] = [
  "New", "Contacted", "Qualified", "Visit", 
  "Offre", "Deposit", "Signed", "Gagné", "Perdu"
];

const StatusSection = ({
  formData,
  handleInputChange,
  handleTagToggle,
  leadStatuses = PURCHASE_STATUSES,
  leadTags = ["Vip", "Hot", "Serious", "Cold", "No response", "No phone", "Fake"] as LeadTag[],
  sources
}: StatusSectionProps) => {
  // Handle tag toggle if provided, otherwise create an empty handler
  const handleTagToggleInternal = handleTagToggle || ((tag: LeadTag) => {
    // Create a new array with the updated tags
    const updatedTags = formData.tags?.includes(tag)
      ? formData.tags.filter(t => t !== tag)
      : [...(formData.tags || []), tag];
    
    // Create a custom event-like object that conforms to the expected structure
    const syntheticEvent = {
      target: {
        name: 'tags',
        value: updatedTags
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    
    // Pass this synthetic event to the handleInputChange function
    handleInputChange(syntheticEvent);
  });

  // Format dates for display, if they exist
  const formattedLastContact = formData.lastContactedAt 
    ? format(new Date(formData.lastContactedAt), 'dd/MM/yyyy HH:mm')
    : '';
    
  const formattedNextFollowUp = formData.nextFollowUpDate 
    ? format(new Date(formData.nextFollowUpDate), 'dd/MM/yyyy HH:mm')
    : '';

  // Handle pipeline type change with appropriate validations and transformations
  const handlePipelineTypeChange = (value: PipelineType) => {
    if (value === formData.pipelineType) return; // No change needed
    
    // Create a pipeline change event
    const pipelineEvent = {
      target: {
        name: 'pipelineType',
        value: value
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    
    // Apply the pipeline type change
    handleInputChange(pipelineEvent);
    
    // Check if we need to adjust the status based on pipeline type
    const currentStatus = formData.status;
    const targetStatusList = value === 'purchase' ? PURCHASE_STATUSES : RENTAL_STATUSES;
    
    // If current status is not valid in the new pipeline type, reset to "New"
    if (!targetStatusList.includes(currentStatus)) {
      const statusEvent = {
        target: {
          name: 'status',
          value: 'New'
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      
      handleInputChange(statusEvent);
      
      toast({
        title: "Statut réinitialisé",
        description: `Le statut a été réinitialisé à "New" car "${currentStatus}" n'est pas valide pour un dossier de ${value === 'purchase' ? 'achat' : 'location'}.`
      });
    }
  };

  // Determine which status list to use based on pipeline type
  const availableStatuses = formData.pipelineType === 'rental' 
    ? RENTAL_STATUSES 
    : PURCHASE_STATUSES;

  return (
    <FormSection title="Statut et Suivi">
      <FormInput
        label="Type de pipeline"
        name="pipelineType"
        value={formData.pipelineType || 'purchase'}
        onChange={() => {}}
        icon={Home}
        renderCustomField={() => (
          <RadioSelectButtons
            options={['purchase', 'rental'] as PipelineType[]}
            selectedValue={formData.pipelineType || 'purchase'}
            onSelect={handlePipelineTypeChange}
            labelMapping={{
              purchase: 'Achat',
              rental: 'Location'
            }}
          />
        )}
      />

      <FormInput
        label="Statut du lead"
        name="status"
        type="select"
        value={formData.status}
        onChange={handleInputChange}
        required
        icon={Activity}
        options={availableStatuses.map(status => ({ value: status, label: status }))}
      />

      <FormInput
        label="Tags"
        name="tags"
        value=""
        onChange={() => {}}
        icon={Activity}
        renderCustomField={() => (
          <MultiSelectButtons
            options={leadTags}
            selectedValues={formData.tags || []}
            onToggle={handleTagToggleInternal}
          />
        )}
      />

      <FormInput
        label="Responsable du suivi"
        name="assignedTo"
        value={formData.assignedTo || ''}
        onChange={() => {}}
        renderCustomField={() => (
          <TeamMemberSelect
            value={formData.assignedTo}
            onChange={(value) => {
              const event = {
                target: {
                  name: 'assignedTo',
                  value: value || ''
                }
              } as React.ChangeEvent<HTMLInputElement>;
              handleInputChange(event);
            }}
          />
        )}
      />

      <FormInput
        label="Date du dernier contact"
        name="lastContactedAt"
        type="text"
        value={formattedLastContact}
        onChange={() => {}}
        icon={CalendarClock}
        disabled={true}
        helpText="Mise à jour automatique lors d'une action"
      />

      <FormInput
        label="Prochain suivi prévu"
        name="nextFollowUpDate"
        type="text"
        value={formattedNextFollowUp}
        onChange={() => {}}
        icon={CalendarDays}
        disabled={true}
        helpText="Programmé automatiquement lors de la création d'une action"
      />
    </FormSection>
  );
};

export default StatusSection;
