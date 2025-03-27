
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { LeadStatus } from '@/components/common/StatusBadge';
import { LeadTag } from '@/components/common/TagBadge';
import ActionButtons from './filters/ActionButtons';

export interface FilterOptions {
  status: LeadStatus | null;
  tags: LeadTag[];
  assignedTo: string | null;
  minBudget: string;
  maxBudget: string;
  location: string;
  purchaseTimeframe: string | null;
  propertyType: string | null;
}

interface PipelineFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  onApplyFilters?: () => void;
  assignedToOptions: { id: string; name: string }[];
  isFilterActive: (filterName: string) => boolean;
}

const PipelineFilters: React.FC<PipelineFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
  assignedToOptions,
  isFilterActive
}) => {
  // Update filter state for string/null values
  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  // Update filter state for array values (tags)
  const handleTagToggle = (tag: LeadTag) => {
    const updatedTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    
    handleFilterChange('tags', updatedTags);
  };

  // Définir les statuts disponibles
  const statuses: LeadStatus[] = [
    'New', 'Contacted', 'Qualified', 'Proposal', 'Visit', 
    'Offer', 'Deposit', 'Signed', 'Gagné', 'Perdu'
  ];

  // Définir les tags disponibles
  const tags: LeadTag[] = [
    'Hot', 'Cold', 'Vip', 'No response', 'Serious'
  ];

  return (
    <div className="space-y-4 pb-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Statut</label>
          <Select
            value={filters.status || ''}
            onValueChange={(value) => handleFilterChange('status', value || null)}
          >
            <SelectTrigger className={isFilterActive('status') ? 'border-primary' : ''}>
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les statuts</SelectItem>
              {statuses.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Assigné à</label>
          <Select
            value={filters.assignedTo || ''}
            onValueChange={(value) => handleFilterChange('assignedTo', value || null)}
          >
            <SelectTrigger className={isFilterActive('assignedTo') ? 'border-primary' : ''}>
              <SelectValue placeholder="Tous les agents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les agents</SelectItem>
              {assignedToOptions.map(agent => (
                <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Tags</label>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <div key={tag} className="flex items-center space-x-2">
              <Checkbox
                id={`tag-${tag}`}
                checked={filters.tags.includes(tag)}
                onCheckedChange={() => handleTagToggle(tag)}
                className={filters.tags.includes(tag) ? 'text-primary' : ''}
              />
              <label
                htmlFor={`tag-${tag}`}
                className="text-sm"
              >
                {tag}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Budget</label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minBudget}
            onChange={(e) => handleFilterChange('minBudget', e.target.value)}
            className={isFilterActive('budget') ? 'border-primary' : ''}
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxBudget}
            onChange={(e) => handleFilterChange('maxBudget', e.target.value)}
            className={isFilterActive('budget') ? 'border-primary' : ''}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Lieu</label>
        <Input
          placeholder="Ville ou région"
          value={filters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
          className={isFilterActive('location') ? 'border-primary' : ''}
        />
      </div>

      <ActionButtons 
        onClear={onClearFilters} 
        onApply={onApplyFilters} 
      />
    </div>
  );
};

export default PipelineFilters;
