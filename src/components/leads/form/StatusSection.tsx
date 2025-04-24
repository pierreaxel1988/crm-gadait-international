import React from 'react';
import { CalendarClock, CalendarDays, Activity, Home, MapPin } from 'lucide-react';
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
import { getStatusesForPipeline, handlePipelineTypeTransition } from '@/utils/pipelineUtils';
import LocationFilter from '@/components/pipeline/filters/LocationFilter';

interface StatusSectionProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleTagToggle?: (tag: LeadTag) => void;
  leadStatuses?: LeadStatus[];
  leadTags?: LeadTag[];
  sources?: LeadSource[];
}

const StatusSection = ({
  formData,
  handleInputChange,
  handleTagToggle,
  leadTags = ["Vip", "Hot", "Serious", "Cold", "No response", "No phone", "Fake"] as LeadTag[],
  sources
}: StatusSectionProps) => {
  const handleTagToggleInternal = handleTagToggle || ((tag: LeadTag) => {
    const updatedTags = formData.tags?.includes(tag)
      ? formData.tags.filter(t => t !== tag)
      : [...(formData.tags || []), tag];
    
    const syntheticEvent = {
      target: {
        name: 'tags',
        value: updatedTags
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(syntheticEvent);
  });

  const formattedLastContact = formData.lastContactedAt 
    ? format(new Date(formData.lastContactedAt), 'dd/MM/yyyy HH:mm')
    : '';
    
  const formattedNextFollowUp = formData.nextFollowUpDate 
    ? format(new Date(formData.nextFollowUpDate), 'dd/MM/yyyy HH:mm')
    : '';

  const handleStatusChange = (newStatus: LeadStatus) => {
    const statusEvent = {
      target: {
        name: 'status',
        value: newStatus
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(statusEvent);
  };

  const handlePipelineTypeChange = (value: PipelineType) => {
    if (value === formData.pipelineType) return;
    
    const originalPipelineType = formData.pipelineType || 'purchase';
    
    const pipelineEvent = {
      target: {
        name: 'pipelineType',
        value: value
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(pipelineEvent);
    
    if (formData.id) {
      handlePipelineTypeTransition(
        formData.id,
        formData.status,
        originalPipelineType, 
        value,
        handleStatusChange
      );
    }
  };

  const handleLocationChange = (location: string) => {
    const locationEvent = {
      target: {
        name: 'desiredLocation',
        value: location
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(locationEvent);
  };

  const availableStatuses = getStatusesForPipeline(formData.pipelineType || 'purchase');

  const getStatusLabel = (status: LeadStatus): string => {
    if (formData.pipelineType === 'owners') {
      const ownerStatusLabels: Record<LeadStatus, string> = {
        'New': 'Premier contact',
        'Contacted': 'Rendez-vous programmé',
        'Qualified': 'Visite effectuée',
        'Proposal': 'Mandat en négociation',
        'Signed': 'Mandat signé',
        'Visit': 'Bien en commercialisation',
        'Offer': 'Offre reçue',
        'Offer': 'Offre reçue',
        'Deposit': 'Compromis signé',
        'Gagné': 'Vente finalisée',
        'Perdu': 'Perdu/Annulé'
      };
      return ownerStatusLabels[status] || status;
    }
    return status;
  };

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
            options={['purchase', 'rental', 'owners'] as PipelineType[]}
            selectedValue={formData.pipelineType || 'purchase'}
            onSelect={handlePipelineTypeChange}
            labelMapping={{
              purchase: 'Achat',
              rental: 'Location',
              owners: 'Propriétaires'
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
        options={availableStatuses.map(status => ({ 
          value: status, 
          label: getStatusLabel(status)
        }))}
      />

      {formData.pipelineType === 'owners' && (
        <FormInput
          label="Localisation"
          name="desiredLocation"
          value={formData.desiredLocation || ''}
          onChange={() => {}}
          icon={MapPin}
          renderCustomField={() => (
            <LocationFilter
              location={formData.desiredLocation || ''}
              onLocationChange={handleLocationChange}
            />
          )}
        />
      )}

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
