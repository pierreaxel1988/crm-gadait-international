
import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import NotificationBadge from './NotificationBadge';
import { Link } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const NotificationsDropdown = () => {
  const isMobile = useIsMobile();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const popoverRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min`;
    } else if (diffInMinutes < 24 * 60) {
      return `${Math.floor(diffInMinutes / 60)} h`;
    } else {
      return format(date, 'dd MMM', { locale: fr });
    }
  };
  
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.type === 'action' && notification.leadId) {
      navigate(`/leads/${notification.leadId}`);
    }
    setOpen(false);
  };
  
  const recentNotifications = notifications.slice(0, 5);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="rounded-md p-1.5 transition-colors duration-200 relative hover:bg-white/10">
          <Bell className="h-5 w-5 text-white" />
          <NotificationBadge count={unreadCount || 0} />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        ref={popoverRef}
        className="w-80 p-0 bg-white rounded-lg shadow-luxury" 
        align="end" 
        sideOffset={5}
      >
        <div className="py-2 px-3 border-b border-loro-pearl flex justify-between items-center">
          <h3 className="font-medium text-loro-navy">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-xs bg-loro-pearl/30 text-loro-hazel px-2 py-0.5 rounded-full">
              {unreadCount} non {unreadCount > 1 ? 'lues' : 'lue'}
            </span>
          )}
        </div>
        
        <div className="max-h-[300px] overflow-y-auto">
          {recentNotifications.length > 0 ? (
            recentNotifications.map(notification => (
              <div
                key={notification.id}
                className={`p-3 border-b border-loro-pearl/50 cursor-pointer hover:bg-loro-pearl/5 transition-colors ${!notification.read ? 'bg-loro-pearl/10' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-medium text-loro-navy line-clamp-1">
                    {notification.title}
                  </h4>
                  <span className="text-xs text-loro-hazel ml-2">
                    {formatTime(notification.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-loro-navy/70 mt-1 line-clamp-2">
                  {notification.message}
                </p>
              </div>
            ))
          ) : (
            <div className="py-6 text-center">
              <AspectRatio ratio={1/1} className="w-12 mx-auto mb-2">
                <div className="h-full w-full flex items-center justify-center bg-loro-pearl/30 rounded-full">
                  <Bell className="h-6 w-6 text-loro-sand" />
                </div>
              </AspectRatio>
              <p className="text-sm text-loro-navy/70">Pas de notifications</p>
            </div>
          )}
        </div>
        
        <div className="p-2 border-t border-loro-pearl">
          <Button 
            variant="outline" 
            className="w-full text-sm text-loro-hazel border-loro-hazel hover:bg-loro-pearl/10"
            onClick={() => {
              setOpen(false);
              navigate('/notifications');
            }}
          >
            Voir toutes les notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsDropdown;
