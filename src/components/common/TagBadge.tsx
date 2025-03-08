
import React from 'react';
import { cn } from '@/lib/utils';

export type LeadTag = 'Vip' | 'Hot' | 'Serious' | 'Cold' | 'No response' | 'No phone' | 'Fake';

interface TagBadgeProps {
  tag: LeadTag;
  className?: string;
}

const TagBadge = ({ tag, className }: TagBadgeProps) => {
  const getTagStyles = (tag: LeadTag) => {
    switch (tag) {
      case 'Vip':
        return 'bg-luxury-200 text-luxury-800 dark:bg-luxury-900/40 dark:text-luxury-300';
      case 'Hot':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'Serious':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Cold':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'No response':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'No phone':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Fake':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <span
      className={cn(
        'luxury-badge text-xs',
        getTagStyles(tag),
        className
      )}
    >
      {tag}
    </span>
  );
};

export default TagBadge;
