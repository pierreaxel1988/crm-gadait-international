
import React from 'react';
import TagBadge, { LeadTag } from '@/components/common/TagBadge';
import { useIsMobile } from '@/hooks/use-mobile';

interface TagListProps {
  tags: LeadTag[];
  maxTagsToShow?: number;
}

const TagList = ({ tags, maxTagsToShow = 1 }: TagListProps) => {
  const isMobile = useIsMobile();
  
  if (!tags || tags.length === 0) return null;
  
  // Determine how many tags to show
  const tagsToDisplay = isMobile ? 1 : Math.min(tags.length, maxTagsToShow);
  const displayTags = tags.slice(0, tagsToDisplay);
  const remainingCount = tags.length - tagsToDisplay;
  
  return (
    <div className="flex flex-wrap gap-1">
      {displayTags.map(tag => (
        <TagBadge 
          key={tag} 
          tag={tag} 
          className="text-xs py-0.5 px-2 font-futura tracking-wide" 
        />
      ))}
      {remainingCount > 0 && (
        <span className="text-xs text-loro-navy/70 px-1 flex items-center">
          +{remainingCount} {remainingCount === 1 ? 'autre' : 'autres'}
        </span>
      )}
    </div>
  );
};

export default TagList;
