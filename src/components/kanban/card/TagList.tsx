
import React from 'react';
import TagBadge, { LeadTag } from '@/components/common/TagBadge';

interface TagListProps {
  tags: LeadTag[];
}

const TagList = ({ tags }: TagListProps) => {
  if (!tags || tags.length === 0) return null;
  
  return (
    <div className="mb-3 flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <TagBadge key={tag} tag={tag} className="text-[10px] py-0.5" />
      ))}
    </div>
  );
};

export default TagList;
