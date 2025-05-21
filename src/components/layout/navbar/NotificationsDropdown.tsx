
import React from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import NotificationBadge from './NotificationBadge';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';

const NotificationsDropdown = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { user, isAdmin, isCommercial } = useAuth();

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="rounded-md p-1.5 transition-transform duration-200 hover:scale-110 relative touch-none" onClick={handleNotificationClick}>
            <Bell className="h-5 w-5 text-white" />
            <NotificationBadge count={unreadCount} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <span>Notifications</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default NotificationsDropdown;
