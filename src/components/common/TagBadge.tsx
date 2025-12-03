
import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export type LeadTag = 'Vip' | 'Hot' | 'Serious' | 'Cold' | 'No response' | 'No phone' | 'Fake' | 'Imported' | 'Not a fit';

interface TagBadgeProps {
  tag: LeadTag;
  className?: string;
}

const TagBadge = ({ tag, className }: TagBadgeProps) => {
  // Determine the style based on the tag using loro color palette
  const getTagStyle = () => {
    switch (tag) {
      case 'Vip':
        return 'bg-loro-300 text-loro-900 hover:bg-loro-300 border-loro-900 border-opacity-20';
      case 'Hot':
        return 'bg-[#EBD5CE] text-loro-terracotta hover:bg-[#EBD5CE] border-loro-terracotta border-opacity-20';
      case 'Serious':
        return 'bg-loro-200 text-loro-700 hover:bg-loro-200 border-loro-700 border-opacity-20';
      case 'Cold':
        return 'bg-loro-50 text-loro-800 hover:bg-loro-50 border-loro-800 border-opacity-20';
      case 'No response':
        return 'bg-loro-100 text-loro-700 hover:bg-loro-100 border-loro-700 border-opacity-20';
      case 'No phone':
        return 'bg-loro-sand text-loro-hazel hover:bg-loro-sand border-loro-hazel border-opacity-20';
      case 'Fake':
        return 'bg-loro-pearl text-loro-navy hover:bg-loro-pearl border-loro-navy border-opacity-20';
      case 'Imported':
        return 'bg-loro-white text-loro-500 hover:bg-loro-white border-loro-500 border-opacity-20';
      case 'Not a fit':
        return 'bg-red-100 text-red-700 hover:bg-red-100 border-red-700 border-opacity-20';
      default:
        return 'bg-loro-100 text-loro-800 hover:bg-loro-100 border-loro-800 border-opacity-20';
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'px-2 py-1 text-xs font-medium rounded-full border transition-transform hover:scale-105 duration-200', 
        getTagStyle(),
        className
      )}
    >
      {tag}
    </Badge>
  );
};

export default TagBadge;
