
import React from 'react';
import { CalendarClock, CalendarDays, UserCircle, Activity } from 'lucide-react';
import { LeadDetailed } from '@/types/lead';
import { LeadStatus } from '@/components/common/StatusBadge';
import { LeadTag } from '@/components/common/TagBadge';
import FormSection from './FormSection';
import FormInput from './FormInput';
import MultiSelectButtons from './MultiSelectButtons';

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
        onChange={handleInputChange}
        icon={UserCircle}
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
