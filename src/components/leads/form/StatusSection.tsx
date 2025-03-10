
import React from 'react';
import { CalendarClock, CalendarDays } from 'lucide-react';
import { LeadDetailed } from '@/types/lead';
import { LeadStatus } from '@/components/common/StatusBadge';
import { LeadTag } from '@/components/common/TagBadge';
import FormSection from './FormSection';
import FormField from './FormField';
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
      <FormField label="Statut du lead*">
        <select
          name="status"
          required
          value={formData.status}
          onChange={handleInputChange}
          className="luxury-input w-full"
        >
          {leadStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </FormField>

      <FormField label="Tags">
        <MultiSelectButtons
          options={leadTags}
          selectedValues={formData.tags}
          onToggle={handleTagToggle}
        />
      </FormField>

      <FormField label="Responsable du suivi">
        <input
          type="text"
          name="assignedTo"
          value={formData.assignedTo || ''}
          onChange={handleInputChange}
          className="luxury-input w-full"
        />
      </FormField>

      <FormField label={
        <span className="flex items-center">
          <CalendarClock className="h-4 w-4 mr-1" /> Date du dernier contact
        </span>
      }>
        <input
          type="date"
          name="lastContactedAt"
          value={formData.lastContactedAt || ''}
          onChange={handleInputChange}
          className="luxury-input w-full"
        />
      </FormField>

      <FormField label={
        <span className="flex items-center">
          <CalendarDays className="h-4 w-4 mr-1" /> Prochain suivi prévu
        </span>
      }>
        <input
          type="date"
          name="nextFollowUpDate"
          value={formData.nextFollowUpDate || ''}
          onChange={handleInputChange}
          className="luxury-input w-full"
        />
      </FormField>
    </FormSection>
  );
};

export default StatusSection;
