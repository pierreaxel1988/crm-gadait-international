
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown, Filter, Tag, User, DollarSign, MapPin, Clock, Home, X } from 'lucide-react';
import { LeadStatus } from '@/components/common/StatusBadge';
import { LeadTag } from '@/components/common/TagBadge';
import TagBadge from '@/components/common/TagBadge';
import { PropertyType, PurchaseTimeframe } from '@/types/lead';
import { useIsMobile } from '@/hooks/use-mobile';

export interface FilterOptions {
  status: LeadStatus | null;
  tags: LeadTag[];
  assignedTo: string | null;
  minBudget: string;
  maxBudget: string;
  location: string;
  purchaseTimeframe: PurchaseTimeframe | null;
  propertyType: PropertyType | null;
}

interface PipelineFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  assignedToOptions: string[];
  isFilterActive: boolean;
}

const PipelineFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  assignedToOptions,
  isFilterActive
}: PipelineFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleStatusChange = (status: LeadStatus | null) => {
    onFilterChange({ ...filters, status });
  };

  const toggleTag = (tag: LeadTag) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    
    onFilterChange({ ...filters, tags: newTags });
  };

  const handleAssignedToChange = (assignedTo: string | null) => {
    onFilterChange({ ...filters, assignedTo });
  };

  const handleBudgetChange = (type: 'min' | 'max', value: string) => {
    if (type === 'min') {
      onFilterChange({ ...filters, minBudget: value });
    } else {
      onFilterChange({ ...filters, maxBudget: value });
    }
  };

  const handleLocationChange = (location: string) => {
    onFilterChange({ ...filters, location });
  };

  const handleTimeframeChange = (timeframe: PurchaseTimeframe | null) => {
    onFilterChange({ ...filters, purchaseTimeframe: timeframe });
  };

  const handlePropertyTypeChange = (propertyType: PropertyType | null) => {
    onFilterChange({ ...filters, propertyType });
  };

  const statuses: (LeadStatus | null)[] = [
    null, 'New', 'Contacted', 'Qualified', 'Visit', 'Proposal', 'Offer', 'Deposit', 'Signed'
  ];

  const tags: LeadTag[] = [
    'Vip', 'Hot', 'Serious', 'Cold', 'No response', 'No phone', 'Fake'
  ];

  const timeframes: (PurchaseTimeframe | null)[] = [
    null, 'Moins de trois mois', 'Plus de trois mois'
  ];

  const propertyTypes: (PropertyType | null)[] = [
    null, 'Villa', 'Appartement', 'Penthouse', 'Maison', 'Duplex', 'Chalet', 
    'Terrain', 'Manoir', 'Maison de ville', 'Château', 'Local commercial', 
    'Commercial', 'Hotel', 'Vignoble', 'Autres'
  ];

  return (
    <div className="relative w-full">
      <Button
        variant={isFilterActive ? "default" : "outline"}
        className="flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Filter className="h-4 w-4" />
        <span className="hidden md:inline">Filtres</span>
        {isFilterActive && (
          <span className="bg-background text-xs rounded-full h-5 w-5 flex items-center justify-center text-foreground">
            !
          </span>
        )}
      </Button>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div />
        </PopoverTrigger>
        <PopoverContent className={cn(
          "w-[340px] sm:w-[420px] p-4 shadow-md", 
          isMobile && "max-h-[70vh] overflow-y-auto"
        )} align="start">
          <h3 className="text-lg font-medium mb-4">Filtres</h3>
          
          <div className="space-y-4">
            {/* Status Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Filter className="h-4 w-4" /> Statut
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {statuses.map((status) => (
                  <Button
                    key={status || 'all'}
                    variant={filters.status === status ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => handleStatusChange(status)}
                  >
                    {status || 'Tous'}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Tags Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Tag className="h-4 w-4" /> Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    className={`flex items-center ${filters.tags.includes(tag) ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => toggleTag(tag)}
                  >
                    <TagBadge tag={tag} className="text-xs" />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Assigned To Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <User className="h-4 w-4" /> Agent assigné
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={filters.assignedTo === null ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => handleAssignedToChange(null)}
                >
                  Tous
                </Button>
                {assignedToOptions.map((user) => (
                  <Button
                    key={user}
                    variant={filters.assignedTo === user ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => handleAssignedToChange(user)}
                  >
                    {user}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Budget Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Budget
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Min €</label>
                  <Input
                    type="text"
                    value={filters.minBudget}
                    onChange={(e) => handleBudgetChange('min', e.target.value)}
                    placeholder="Min"
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Max €</label>
                  <Input
                    type="text"
                    value={filters.maxBudget}
                    onChange={(e) => handleBudgetChange('max', e.target.value)}
                    placeholder="Max"
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>
            
            {/* Location Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Localisation
              </h4>
              <Input
                type="text"
                value={filters.location}
                onChange={(e) => handleLocationChange(e.target.value)}
                placeholder="Ville, région, pays..."
                className="h-8 text-sm"
              />
            </div>
            
            {/* Purchase Timeframe Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Délai d'achat
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {timeframes.map((timeframe) => (
                  <Button
                    key={timeframe || 'all'}
                    variant={filters.purchaseTimeframe === timeframe ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => handleTimeframeChange(timeframe)}
                  >
                    {timeframe ? (timeframe === 'Moins de trois mois' ? '< 3 mois' : '> 3 mois') : 'Tous'}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Property Type Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Home className="h-4 w-4" /> Type de bien
              </h4>
              <div className="grid grid-cols-3 gap-2 max-h-[100px] overflow-y-auto">
                <Button
                  variant={filters.propertyType === null ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => handlePropertyTypeChange(null)}
                >
                  Tous
                </Button>
                {propertyTypes.filter(t => t !== null).map((type) => (
                  <Button
                    key={type}
                    variant={filters.propertyType === type ? "default" : "outline"}
                    size="sm"
                    className="text-xs truncate"
                    onClick={() => handlePropertyTypeChange(type as PropertyType)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-between pt-2 mt-2 border-t">
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                <X className="h-4 w-4 mr-2" /> Effacer
              </Button>
              <Button size="sm" onClick={() => setIsOpen(false)}>
                <Check className="h-4 w-4 mr-2" /> Appliquer
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

// Add import for cn util
import { cn } from '@/lib/utils';

export default PipelineFilters;
