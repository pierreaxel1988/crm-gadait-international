
import React from 'react';
import { Check, ChevronDown, Tag } from 'lucide-react';
import { LeadTag } from '@/components/common/TagBadge';
import TagBadge from '@/components/common/TagBadge';

interface TagsFilterProps {
  selectedTags: LeadTag[];
  toggleTag: (tag: LeadTag) => void;
  showTagsDropdown: boolean;
  setShowTagsDropdown: (show: boolean) => void;
  setShowStatusDropdown: (show: boolean) => void;
}

const TagsFilter: React.FC<TagsFilterProps> = ({
  selectedTags,
  toggleTag,
  showTagsDropdown,
  setShowTagsDropdown,
  setShowStatusDropdown
}) => {
  const tags: LeadTag[] = [
    'Vip',
    'Hot',
    'Serious',
    'Cold',
    'No response',
    'No phone',
    'Fake',
    'Imported',
    'Not a fit'
  ];

  return (
    <div className="relative w-full sm:w-auto">
      <button
        className="luxury-input pl-3 pr-10 flex items-center gap-2 w-full justify-between"
        onClick={() => {
          setShowTagsDropdown(!showTagsDropdown);
          setShowStatusDropdown(false);
        }}
      >
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4" />
          <span>
            {selectedTags.length === 0
              ? 'Tags'
              : `${selectedTags.length} selected`}
          </span>
        </div>
        <ChevronDown className="h-4 w-4" />
      </button>
      {showTagsDropdown && (
        <div className="absolute left-0 right-0 sm:left-auto sm:w-48 mt-1 bg-card rounded-md border border-border shadow-luxury z-10">
          <div className="py-1">
            {tags.map((tag) => (
              <button
                key={tag}
                className="flex items-center justify-between w-full px-4 py-2 text-sm text-foreground hover:bg-accent"
                onClick={() => toggleTag(tag)}
              >
                <TagBadge tag={tag} className="text-xs" />
                {selectedTags.includes(tag) && <Check className="h-4 w-4 ml-2" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagsFilter;
