
import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
}

interface NotificationsDropdownProps {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  notifications,
  setNotifications
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? {
        ...notification,
        read: true
      } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })));
    toast.success('All notifications marked as read');
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInMinutes < 24 * 60) {
      return `${Math.floor(diffInMinutes / 60)} hr ago`;
    } else {
      return `${Math.floor(diffInMinutes / (60 * 24))} days ago`;
    }
  };

  // Close dropdown when clicking outside
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

  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleNotifications} 
        className="relative rounded-md p-1 md:p-2 text-loro-navy hover:text-loro-hazel transition-colors duration-200" 
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 h-3 w-3 md:h-4 md:w-4 rounded-full bg-loro-terracotta text-[#F5F5F0] flex items-center justify-center text-[8px] md:text-xs font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-10 border border-loro-pearl">
          <div className="p-4 border-b border-loro-pearl flex justify-between items-center">
            <h3 className="text-loro-navy font-medium">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead} 
                className="text-xs text-loro-hazel hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-4 border-b border-loro-pearl cursor-pointer hover:bg-gray-50 ${notification.read ? "bg-white" : "bg-loro-pearl/10"}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium text-loro-navy">{notification.title}</h4>
                    <span className="text-xs text-gray-500">{formatTime(notification.timestamp)}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                </div>
              ))
            ) : (
              <p className="p-4 text-center text-gray-500 text-sm">No notifications</p>
            )}
          </div>
          
          <div className="p-2 border-t border-loro-pearl bg-gray-50">
            <button className="w-full text-center text-xs text-loro-hazel hover:underline py-1">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
