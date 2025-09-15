import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tag, X } from 'lucide-react';
import { LeadTag } from '@/components/common/TagBadge';

interface EnhancedTagsFilterProps {
  selectedTags: LeadTag[];
  onTagsChange: (tags: LeadTag[]) => void;
}

const EnhancedTagsFilter = ({ selectedTags, onTagsChange }: EnhancedTagsFilterProps) => {
  const availableTags: LeadTag[] = [
    'Vip', 'Hot', 'Serious', 'Cold', 'No response', 'Imported'
  ];

  const toggleTag = (tag: LeadTag) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const clearTags = () => {
    onTagsChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          <h4 className="font-medium text-foreground">Étiquettes</h4>
          {selectedTags.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selectedTags.length} sélectionnée{selectedTags.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        
        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearTags}
            className="text-xs gap-1 h-auto p-2"
          >
            <X className="h-3 w-3" />
            Effacer
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          
          return (
            <Button
              key={tag}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className={`text-xs h-auto p-3 transition-all duration-200 ${
                isSelected 
                  ? 'shadow-sm border-primary/50' 
                  : 'hover:border-primary/30'
              }`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Button>
          );
        })}
      </div>

      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Étiquettes sélectionnées :</p>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="gap-1 pr-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                onClick={() => toggleTag(tag)}
              >
                {tag}
                <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTagsFilter;