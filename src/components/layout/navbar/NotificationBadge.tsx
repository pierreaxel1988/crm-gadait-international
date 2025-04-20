
import React from 'react';

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count, className }) => {
  const displayCount = count > 99 ? '99+' : count.toString();
  
  return (
    <span 
      className={`
        absolute -top-1.5 -right-1.5
        min-w-[20px] h-5
        px-1.5
        rounded-full 
        bg-gradient-to-br from-loro-terracotta to-loro-terracotta/90
        text-loro-white 
        flex items-center justify-center 
        text-[10px] font-semibold
        animate-pulse-soft
        border border-loro-white
        shadow-sm
        select-none
        transition-all duration-200
        ${className || ''}
      `}
      aria-hidden="true"
    >
      {displayCount}
    </span>
  );
};

export default NotificationBadge;
