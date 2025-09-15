
import React from 'react';
import { Tag, X } from 'lucide-react';
import { LeadTag } from '@/components/common/TagBadge';
import TagBadge from '@/components/common/TagBadge';
import { Button } from '@/components/ui/button';

interface TagsFilterProps {
  selectedTags: LeadTag[];
  onTagsChange: (tags: LeadTag[]) => void;
}

const TagsFilter: React.FC<TagsFilterProps> = ({
  selectedTags,
  onTagsChange
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
    <div className="space-y-2">
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <Tag className="h-4 w-4" /> Tags
      </h4>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {tags.map((tag) => (
          <Button
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            size="sm"
            className="text-xs h-7 px-2 whitespace-nowrap"
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </Button>
        ))}
        
        {selectedTags.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-muted-foreground h-7 px-2"
            onClick={clearTags}
          >
            Tout effacer
          </Button>
        )}
      </div>
      
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-muted-foreground">Sélectionnés:</span>
          {selectedTags.map(tag => (
            <div key={tag} className="flex items-center">
              <TagBadge tag={tag} className="text-xs h-6" />
              <button 
                onClick={() => toggleTag(tag)}
                className="ml-1 bg-background rounded-full w-4 h-4 flex items-center justify-center hover:bg-muted transition-colors"
                aria-label={`Supprimer le tag ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagsFilter;
