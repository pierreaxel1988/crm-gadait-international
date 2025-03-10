
import React from 'react';
import { CalendarClock, CalendarDays, Check } from 'lucide-react';
import { LeadDetailed } from '@/types/lead';
import { LeadStatus } from '@/components/common/StatusBadge';
import { LeadTag } from '@/components/common/TagBadge';
import { cn } from '@/lib/utils';

interface StatusFieldsProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleTagToggle: (tag: LeadTag) => void;
}

const StatusFields: React.FC<StatusFieldsProps> = ({
  formData,
  handleInputChange,
  handleTagToggle
}) => {
  const leadStatuses: LeadStatus[] = [
    'New', 'Contacted', 'Qualified', 'Proposal', 'Visit', 
    'Offer', 'Deposit', 'Signed'
  ];
  
  const leadTags: LeadTag[] = ['Vip', 'Hot', 'Serious', 'Cold', 'No response', 'No phone', 'Fake'];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium border-b pb-2">Statut et Suivi</h3>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Statut du lead*
        </label>
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
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {leadTags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagToggle(tag)}
              className={cn(
                "flex items-center gap-1 py-1 px-2 rounded-full text-xs",
                formData.tags?.includes(tag)
                  ? "bg-primary text-white"
                  : "bg-accent text-accent-foreground hover:bg-accent/80"
              )}
            >
              {formData.tags?.includes(tag) && <Check className="h-3 w-3" />}
              {tag}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Responsable du suivi
        </label>
        <input
          type="text"
          name="assignedTo"
          value={formData.assignedTo || ''}
          onChange={handleInputChange}
          className="luxury-input w-full"
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          <span className="flex items-center">
            <CalendarClock className="h-4 w-4 mr-1" /> Date du dernier contact
          </span>
        </label>
        <input
          type="date"
          name="lastContactedAt"
          value={formData.lastContactedAt || ''}
          onChange={handleInputChange}
          className="luxury-input w-full"
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          <span className="flex items-center">
            <CalendarDays className="h-4 w-4 mr-1" /> Prochain suivi prévu
          </span>
        </label>
        <input
          type="date"
          name="nextFollowUpDate"
          value={formData.nextFollowUpDate || ''}
          onChange={handleInputChange}
          className="luxury-input w-full"
        />
      </div>
    </div>
  );
};

export default StatusFields;
