
import React from 'react';
import TagBadge, { LeadTag } from '@/components/common/TagBadge';

interface TagListProps {
  tags: LeadTag[];
}

const TagList = ({ tags }: TagListProps) => {
  if (!tags || tags.length === 0) return null;
  
  // Only display the first tag in the header
  const firstTag = tags[0];
  
  return (
    <TagBadge key={firstTag} tag={firstTag} className="text-xs py-0.5 px-2 font-futura tracking-wide" />
  );
};

export default TagList;
