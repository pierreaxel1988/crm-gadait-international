
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
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
const NotificationsDropdown = () => {
  const isMobile = useIsMobile();
  const {
    notifications,
    unreadCount,
    markAsRead
  } = useNotifications();
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
      return format(date, 'dd MMM', {
        locale: fr
      });
    }
  };
  const handleNotificationClick = notification => {
    markAsRead(notification.id);
    if (notification.type === 'action' && notification.leadId) {
      navigate(`/leads/${notification.leadId}`);
    }
    setOpen(false);
  };
  const recentNotifications = notifications.slice(0, 5);
  return <TooltipProvider>
      <Popover open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button className="rounded-md p-1.5 transition-colors duration-300 relative hover:bg-white/20 touch-none">
                <Bell className="h-5 w-5 text-white" />
                <NotificationBadge count={unreadCount || 0} />
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          
        </Tooltip>
        <PopoverContent ref={popoverRef} className="w-[calc(100vw-24px)] md:w-84 p-0 bg-loro-white rounded-lg shadow-luxury border-0" align={isMobile ? "center" : "end"} sideOffset={isMobile ? 15 : 10} side={isMobile ? "bottom" : undefined}>
          <div className="py-2.5 px-4 bg-loro-terracotta text-white rounded-t-lg flex justify-between items-center">
            <h3 className="font-futura tracking-wide">Notifications</h3>
            {unreadCount > 0 && <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
                {unreadCount} non {unreadCount > 1 ? 'lues' : 'lue'}
              </span>}
          </div>
          
          <div className="max-h-[300px] md:max-h-[350px] overflow-y-auto smooth-scroll">
            {recentNotifications.length > 0 ? recentNotifications.map(notification => <div key={notification.id} className={`p-3.5 border-b border-loro-pearl/50 cursor-pointer hover:bg-loro-pearl/10 transition-all duration-200 ${!notification.read ? 'bg-loro-pearl/10' : ''}`} onClick={() => handleNotificationClick(notification)}>
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-sm font-medium text-loro-navy line-clamp-1 flex-1">
                    {notification.title}
                  </h4>
                  <span className="text-xs whitespace-nowrap text-loro-terracotta border border-loro-terracotta/70 bg-transparent rounded-full px-2.5 py-0.5">
                    {formatTime(notification.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-loro-navy/80 mt-1.5 line-clamp-2">
                  {notification.message}
                </p>
              </div>) : <div className="py-8 text-center">
                <AspectRatio ratio={1 / 1} className="w-14 mx-auto mb-3">
                  <div className="h-full w-full flex items-center justify-center bg-loro-pearl/40 rounded-full">
                    <Bell className="h-6 w-6 text-loro-sand" />
                  </div>
                </AspectRatio>
                <p className="text-sm text-loro-navy/70 font-futuraLight">Pas de notifications</p>
              </div>}
          </div>
          
          <div className="p-3 border-t border-loro-pearl bg-loro-pearl/5">
            <Button variant="outline" className="w-full text-sm text-loro-terracotta border-loro-terracotta/70 hover:bg-loro-pearl/20 transition-all duration-200" onClick={() => {
            setOpen(false);
            navigate('/notifications');
          }}>
              Voir toutes les notifications
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>;
};
export default NotificationsDropdown;
