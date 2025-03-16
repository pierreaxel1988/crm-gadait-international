
import React from 'react';
import { Tag } from 'lucide-react';
import { LeadTag } from '@/components/common/TagBadge';
import TagBadge from '@/components/common/TagBadge';

interface TagsFilterProps {
  selectedTags: LeadTag[];
  onTagToggle: (tag: LeadTag) => void;
}

const TagsFilter = ({ selectedTags, onTagToggle }: TagsFilterProps) => {
  const tags: LeadTag[] = [
    'Vip', 'Hot', 'Serious', 'Cold', 'No response', 'No phone', 'Fake'
  ];

  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <Tag className="h-4 w-4" /> Tags
      </h4>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            className={`flex items-center ${selectedTags.includes(tag) ? 'ring-2 ring-primary' : ''}`}
            onClick={() => onTagToggle(tag)}
          >
            <TagBadge tag={tag} className="text-xs" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default TagsFilter;
