
import React from 'react';
import { CalendarClock, CalendarDays, Activity, Tag } from 'lucide-react';
import { LeadDetailed, LeadSource } from '@/types/lead';
import { LeadStatus } from '@/components/common/StatusBadge';
import { LeadTag } from '@/components/common/TagBadge';
import FormSection from './FormSection';
import FormInput from './FormInput';
import MultiSelectButtons from './MultiSelectButtons';
import TeamMemberSelect from '@/components/leads/TeamMemberSelect';

interface StatusSectionProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleTagToggle: (tag: LeadTag) => void;
  leadStatuses: LeadStatus[];
  leadTags: LeadTag[];
}

const StatusSection = ({
  formData,
  handleInputChange,
  handleTagToggle,
  leadStatuses,
  leadTags
}: StatusSectionProps) => {
  // Liste des sources définies dans les types
  const leadSources: LeadSource[] = [
    "Site web", 
    "Réseaux sociaux", 
    "Portails immobiliers", 
    "Network", 
    "Repeaters", 
    "Recommandations",
    "Apporteur d'affaire",
    "Idealista",
    "Le Figaro",
    "Properstar",
    "Property Cloud",
    "L'express Property"
  ];

  return (
    <FormSection title="Statut et Suivi">
      <FormInput
        label="Statut du lead"
        name="status"
        type="select"
        value={formData.status}
        onChange={handleInputChange}
        required
        icon={Activity}
        options={leadStatuses.map(status => ({ value: status, label: status }))}
      />

      <FormInput
        label="Source du lead"
        name="source"
        type="select"
        value={formData.source || ''}
        onChange={handleInputChange}
        icon={Tag}
        options={leadSources.map(source => ({ value: source, label: source }))}
        placeholder="Sélectionner une source"
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
            selectedValues={formData.tags}
            onToggle={handleTagToggle}
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
        type="date"
        value={formData.lastContactedAt || ''}
        onChange={handleInputChange}
        icon={CalendarClock}
      />

      <FormInput
        label="Prochain suivi prévu"
        name="nextFollowUpDate"
        type="date"
        value={formData.nextFollowUpDate || ''}
        onChange={handleInputChange}
        icon={CalendarDays}
      />
    </FormSection>
  );
};

export default StatusSection;
