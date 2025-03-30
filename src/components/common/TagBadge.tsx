
import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export type LeadTag = 'Vip' | 'Hot' | 'Serious' | 'Cold' | 'No response' | 'No phone' | 'Fake' | 'Imported';

interface TagBadgeProps {
  tag: LeadTag;
  className?: string;
}

const TagBadge = ({ tag, className }: TagBadgeProps) => {
  // Determine the style based on the tag using loro color palette
  const getTagStyle = () => {
    switch (tag) {
      case 'Vip':
        return 'bg-loro-300 text-loro-900 hover:bg-loro-300';
      case 'Hot':
        return 'bg-[#EBD5CE] text-loro-terracotta hover:bg-[#EBD5CE]';
      case 'Serious':
        return 'bg-loro-200 text-loro-700 hover:bg-loro-200';
      case 'Cold':
        return 'bg-loro-50 text-loro-800 hover:bg-loro-50';
      case 'No response':
        return 'bg-loro-100 text-loro-700 hover:bg-loro-100';
      case 'No phone':
        return 'bg-loro-sand text-loro-hazel hover:bg-loro-sand';
      case 'Fake':
        return 'bg-loro-pearl text-loro-navy hover:bg-loro-pearl';
      case 'Imported':
        return 'bg-loro-white text-loro-500 hover:bg-loro-white';
      default:
        return 'bg-loro-100 text-loro-800 hover:bg-loro-100';
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'px-2 py-1 text-xs font-medium rounded-full border-none transition-transform hover:scale-105 duration-200', 
        getTagStyle(),
        className
      )}
    >
      {tag}
    </Badge>
  );
};

export default TagBadge;
