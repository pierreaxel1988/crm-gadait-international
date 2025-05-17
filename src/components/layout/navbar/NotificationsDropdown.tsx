
import React from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationBadge from './NotificationBadge';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const NotificationsDropdown = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  
  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            className="rounded-md p-1.5 transition-colors duration-300 relative touch-none"
            onClick={handleNotificationClick}
          >
            <Bell className="h-5 w-5 text-white" />
            <NotificationBadge count={unreadCount || 0} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Notifications</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default NotificationsDropdown;
