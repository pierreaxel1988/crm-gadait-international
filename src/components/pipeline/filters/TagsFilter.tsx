
import React, { useState } from 'react';
import { Tag, X, Check } from 'lucide-react';
import { LeadTag } from '@/components/common/TagBadge';
import TagBadge from '@/components/common/TagBadge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

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
      <label className="text-sm font-medium">Tags</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>
                {selectedTags.length === 0
                  ? 'Sélectionner des tags'
                  : `${selectedTags.length} sélectionné${selectedTags.length > 1 ? 's' : ''}`}
              </span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="p-2">
            <div className="grid grid-cols-1 gap-1">
              {tags.map((tag) => (
                <Button
                  key={tag}
                  variant="ghost"
                  className="justify-between px-2"
                  onClick={() => toggleTag(tag)}
                >
                  <TagBadge tag={tag} className="text-xs" />
                  {selectedTags.includes(tag) && <Check className="h-4 w-4 ml-2" />}
                </Button>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 w-full text-muted-foreground hover:text-destructive"
                onClick={clearTags}
              >
                <X className="h-4 w-4 mr-2" />
                Effacer tous les tags
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
      
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
    </div>
  );
};

export default TagsFilter;
