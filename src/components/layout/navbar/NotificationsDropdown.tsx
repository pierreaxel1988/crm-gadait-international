
import React from 'react';
import { Bell } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import NotificationBadge from './NotificationBadge';
import { Link } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';

const NotificationsDropdown = () => {
  const isMobile = useIsMobile();
  const { unreadCount } = useNotifications();
  
  return (
    <Link to="/notifications" className="rounded-md p-1.5 transition-colors duration-200 relative hover:bg-white/10">
      <Bell className="h-5 w-5 text-white" />
      <NotificationBadge count={unreadCount || 0} />
    </Link>
  );
};

export default NotificationsDropdown;
