
import React from 'react';
import { Tag, X } from 'lucide-react';
import { LeadTag } from '@/components/common/TagBadge';
import TagBadge from '@/components/common/TagBadge';
import { Button } from '@/components/ui/button';
import FilterGroup from './FilterGroup';

interface TagsFilterChipsProps {
  selectedTags: LeadTag[];
  onTagsChange: (tags: LeadTag[]) => void;
  className?: string;
}

const TagsFilterChips: React.FC<TagsFilterChipsProps> = ({
  selectedTags,
  onTagsChange,
  className
}) => {
  const tags: LeadTag[] = [
    'Vip',
    'Hot',
    'Serious',
    'Cold',
    'No response',
    'No phone',
    'Fake',
    'Imported'
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
    <FilterGroup title="Tags" className={className}>
      <div className="flex items-center gap-2 text-sm">
        <Tag className="h-4 w-4" />
        <span className="font-medium">Tags</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {tags.map((tag) => (
          <Button
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => toggleTag(tag)}
          >
            <TagBadge tag={tag} className="text-xs py-0" />
          </Button>
        ))}
        
        {selectedTags.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs text-muted-foreground col-span-2 mt-1"
            onClick={clearTags}
          >
            Effacer tous les tags
          </Button>
        )}
      </div>
      
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedTags.map(tag => (
            <div key={tag} className="flex items-center">
              <TagBadge tag={tag} className="text-xs" />
              <button 
                onClick={() => toggleTag(tag)}
                className="ml-1 rounded-full w-4 h-4 flex items-center justify-center bg-muted-foreground/10 hover:bg-muted-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </FilterGroup>
  );
};

export default TagsFilterChips;
