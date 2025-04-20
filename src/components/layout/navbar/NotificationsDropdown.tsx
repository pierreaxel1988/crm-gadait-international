
import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationBadge from './NotificationBadge';
import { MobileNotificationsList } from './notifications/MobileNotificationsList';
import { DesktopNotificationsList } from './notifications/DesktopNotificationsList';

const NotificationsDropdown: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    handleActionComplete,
    unreadCount
  } = useNotifications();
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.type === 'action' && notification.leadId) {
      setShowNotifications(false);
      navigate(`/leads/${notification.leadId}`);
    }
  };
  
  const handleActionCompleteClick = async (notification: Notification, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const success = await handleActionComplete(notification);
    
    if (success) {
      toast.success('Action marquée comme terminée');
    } else {
      toast.error("Impossible de marquer l'action comme terminée");
    }
  };

  const viewAllNotifications = () => {
    setShowNotifications(false);
    navigate('/notifications');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setShowNotifications(!showNotifications)} 
        className="relative rounded-md p-1 md:p-2 text-loro-navy hover:text-loro-hazel transition-colors duration-200" 
        aria-label={`Notifications${unreadCount > 0 ? ` - ${unreadCount} non lues` : ''}`}
      >
        <Bell size={18} />
        {unreadCount > 0 && <NotificationBadge count={unreadCount} />}
      </button>
      
      {isMobile ? (
        <MobileNotificationsList
          open={showNotifications}
          onOpenChange={setShowNotifications}
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onActionComplete={handleActionCompleteClick}
          onMarkAllAsRead={markAllAsRead}
          onViewAll={viewAllNotifications}
          unreadCount={unreadCount}
        />
      ) : (
        showNotifications && (
          <DesktopNotificationsList
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
            onActionComplete={handleActionCompleteClick}
            onMarkAllAsRead={markAllAsRead}
            onViewAll={viewAllNotifications}
            unreadCount={unreadCount}
          />
        )
      )}
    </div>
  );
};

export default NotificationsDropdown;
