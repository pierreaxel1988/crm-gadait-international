
import React from 'react';
import { Notification } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';

interface DesktopNotificationsListProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onActionComplete: (notification: Notification, event: React.MouseEvent) => void;
  onMarkAllAsRead: () => void;
  onViewAll: () => void;
  unreadCount: number;
}

export const DesktopNotificationsList: React.FC<DesktopNotificationsListProps> = ({
  notifications,
  onNotificationClick,
  onActionComplete,
  onMarkAllAsRead,
  onViewAll,
  unreadCount,
}) => {
  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-10 border border-loro-pearl">
      <div className="p-3 border-b border-loro-pearl flex justify-between items-center sticky top-0 bg-white z-10">
        <h3 className="text-loro-navy font-medium">Notifications</h3>
        {unreadCount > 0 && (
          <button 
            onClick={onMarkAllAsRead} 
            className="text-xs text-loro-hazel hover:underline"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>
      
      <div className="max-h-80 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onNotificationClick={onNotificationClick}
              onActionComplete={onActionComplete}
            />
          ))
        ) : (
          <p className="p-4 text-center text-gray-500 text-sm">Aucune notification</p>
        )}
      </div>
      
      <div className="p-2 border-t border-loro-pearl bg-gray-50 sticky bottom-0">
        <button 
          onClick={onViewAll}
          className="w-full text-center text-xs text-loro-hazel hover:underline py-1 font-medium"
        >
          Voir toutes les notifications
        </button>
      </div>
    </div>
  );
};
