import React, { useState, useRef, useEffect } from 'react';
import { Bell, Calendar, CheckCheck, Phone, Users, FileText, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { useNotifications, Notification as AppNotification } from '@/hooks/useNotifications';
import NotificationBadge from './NotificationBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const getActionIcon = (actionType?: string) => {
  switch (actionType?.toLowerCase()) {
    case 'call':
      return <Phone size={16} className="text-blue-500" />;
    case 'meeting':
    case 'rdv':
      return <Users size={16} className="text-purple-500" />;
    case 'email':
      return <MessageCircle size={16} className="text-green-500" />;
    case 'followup':
      return <FileText size={16} className="text-amber-500" />;
    default:
      return <Calendar size={16} className="text-gray-500" />;
  }
};

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
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };
  
  const handleNotificationClick = (notification: AppNotification) => {
    markAsRead(notification.id);
    
    if (notification.type === 'action' && notification.leadId) {
      setShowNotifications(false);
      navigate(`/leads/${notification.leadId}`);
    }
  };
  
  const handleActionCompleteClick = async (notification: AppNotification, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const success = await handleActionComplete(notification);
    
    if (success) {
      toast.success('Action marquée comme terminée');
    } else {
      toast.error("Impossible de marquer l'action comme terminée");
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min`;
    } else if (diffInMinutes < 24 * 60) {
      return `${Math.floor(diffInMinutes / 60)} h`;
    } else {
      return `${Math.floor(diffInMinutes / (60 * 24))} jours`;
    }
  };

  const renderAssignedUser = (assignedToName?: string) => {
    if (!assignedToName) return null;
    
    return (
      <div className="flex items-center mt-2 text-xs text-gray-500">
        <Avatar className="h-5 w-5 mr-1.5 ring-1 ring-loro-white/30 hover:scale-110 transition-transform duration-200">
          <AvatarFallback 
            className="bg-gradient-to-b from-loro-white to-loro-pearl text-[10px] font-futura text-loro-navy/90"
          >
            {assignedToName.split(' ').map(part => part[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <span className="text-xs">Assigné à {assignedToName}</span>
      </div>
    );
  };

  const renderNotificationItem = (notification: AppNotification) => (
    <div 
      key={notification.id} 
      className={`border-b border-loro-pearl cursor-pointer hover:bg-gray-50 ${notification.read ? "bg-white" : "bg-loro-pearl/10"}`}
      onClick={() => handleNotificationClick(notification)}
    >
      <div className="p-3 flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getActionIcon(notification.actionType)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className="text-sm font-medium text-loro-navy line-clamp-1">{notification.title}</h4>
            <span className="text-xs text-gray-500 ml-1 flex-shrink-0">{formatTime(notification.timestamp)}</span>
          </div>
          <p className="text-xs text-gray-600 mt-1 line-clamp-1">{notification.message}</p>
          
          {notification.assignedToName && renderAssignedUser(notification.assignedToName)}
          
          {notification.type === 'action' && (
            <button 
              onClick={(e) => handleActionCompleteClick(notification, e)}
              className="mt-2 flex items-center text-xs text-loro-hazel hover:text-loro-navy"
            >
              <CheckCheck size={12} className="mr-1" />
              Marquer comme terminée
            </button>
          )}
        </div>
      </div>
    </div>
  );

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
  
  const viewAllNotifications = () => {
    setShowNotifications(false);
    navigate('/notifications');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleNotifications} 
        className="relative rounded-md p-1 md:p-2 text-loro-navy hover:text-loro-hazel transition-colors duration-200" 
        aria-label={`Notifications${unreadCount > 0 ? ` - ${unreadCount} non lues` : ''}`}
      >
        <Bell size={18} />
        {unreadCount > 0 && <NotificationBadge count={unreadCount} />}
      </button>
      
      {!isMobile && showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-10 border border-loro-pearl">
          <div className="p-3 border-b border-loro-pearl flex justify-between items-center sticky top-0 bg-white z-10">
            <h3 className="text-loro-navy font-medium">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead} 
                className="text-xs text-loro-hazel hover:underline"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notification => renderNotificationItem(notification))
            ) : (
              <p className="p-4 text-center text-gray-500 text-sm">Aucune notification</p>
            )}
          </div>
          
          <div className="p-2 border-t border-loro-pearl bg-gray-50 sticky bottom-0">
            <button 
              onClick={viewAllNotifications}
              className="w-full text-center text-xs text-loro-hazel hover:underline py-1 font-medium"
            >
              Voir toutes les notifications
            </button>
          </div>
        </div>
      )}
      
      {isMobile && (
        <Drawer open={showNotifications} onOpenChange={setShowNotifications}>
          <DrawerContent className="max-h-[90vh] flex flex-col">
            <DrawerHeader className="sticky top-0 z-10 bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <DrawerTitle className="text-lg font-medium">Notifications</DrawerTitle>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead} 
                  className="text-sm text-loro-hazel"
                >
                  Tout marquer comme lu
                </Button>
              )}
            </DrawerHeader>
            
            <div className="flex-1 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map(notification => renderNotificationItem(notification))
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                  <Bell className="h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-gray-500">Aucune notification</p>
                </div>
              )}
            </div>
            
            <DrawerFooter className="border-t border-gray-100 p-4 sticky bottom-0 bg-white">
              <Button 
                variant="default" 
                className="w-full" 
                onClick={viewAllNotifications}
              >
                Voir toutes les notifications
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
};

export default NotificationsDropdown;
