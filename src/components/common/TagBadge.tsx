
import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export type LeadTag = 'Vip' | 'Hot' | 'Serious' | 'Cold' | 'No response' | 'No phone' | 'Fake' | 'Imported';

interface TagBadgeProps {
  tag: LeadTag;
  className?: string;
}

const TagBadge = ({ tag, className }: TagBadgeProps) => {
  // Determine the style based on the tag
  const getTagStyle = () => {
    switch (tag) {
      case 'Vip':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'Hot':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'Serious':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'Cold':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'No response':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      case 'No phone':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      case 'Fake':
        return 'bg-pink-100 text-pink-800 hover:bg-pink-100';
      case 'Imported':
        return 'bg-teal-100 text-teal-800 hover:bg-teal-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'px-2 py-1 text-xs font-medium rounded-full border-none', 
        getTagStyle(),
        className
      )}
    >
      {tag}
    </Badge>
  );
};

export default TagBadge;
