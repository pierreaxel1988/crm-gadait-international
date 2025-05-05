
import React from 'react';
import { Bell } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import NotificationBadge from './NotificationBadge';

const NotificationsDropdown = () => {
  const isMobile = useIsMobile();
  
  return (
    <button className="rounded-md p-1.5 transition-colors duration-200 relative">
      <Bell className={cn(
        "h-5 w-5",
        isMobile ? "text-white" : "text-loro-navy"
      )} />
      <NotificationBadge count={99} />
    </button>
  );
};

export default NotificationsDropdown;
