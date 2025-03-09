
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
        return 'bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-700/80 dark:text-amber-100';
      case 'Hot':
        return 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-700/80 dark:text-red-100';
      case 'Serious':
        return 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700/80 dark:text-emerald-100';
      case 'Cold':
        return 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-700/80 dark:text-blue-100';
      case 'No response':
        return 'bg-yellow-500 text-yellow-950 hover:bg-yellow-600 dark:bg-yellow-600/80 dark:text-yellow-100';
      case 'No phone':
        return 'bg-purple-500 text-white hover:bg-purple-600 dark:bg-purple-700/80 dark:text-purple-100';
      case 'Fake':
        return 'bg-gray-500 text-white hover:bg-gray-600 dark:bg-gray-700/80 dark:text-gray-100';
      default:
        return 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700/80 dark:text-gray-100';
    }
  };

  return (
    <span
      className={cn(
        'luxury-badge text-xs font-medium px-3 py-1 rounded-full transition-colors',
        getTagStyles(tag),
        className
      )}
    >
      {tag}
    </span>
  );
};

export default TagBadge;
