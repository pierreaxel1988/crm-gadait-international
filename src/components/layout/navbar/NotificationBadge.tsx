
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface NotificationBadgeProps {
  count: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count }) => {
  const isMobile = useIsMobile();
  
  // If count is 0, don't show badge
  if (count === 0) return null;
  
  // If count > 99, show 99+
  const displayCount = count > 99 ? '99+' : count.toString();
  
  return (
    <span className={cn(
      "absolute -top-1 -right-1 rounded-full text-xs px-1 min-w-5 h-5 flex items-center justify-center font-medium",
      isMobile 
        ? "bg-loro-hazel text-white" 
        : "bg-loro-hazel text-white"
    )}>
      {displayCount}
    </span>
  );
};

export default NotificationBadge;
