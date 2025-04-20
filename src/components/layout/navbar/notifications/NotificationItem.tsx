
import React from 'react';
import { CheckCheck } from 'lucide-react';
import { Notification } from '@/hooks/useNotifications';
import { NotificationIcon } from './NotificationIcon';
import { formatNotificationTime } from './notificationUtils';

interface NotificationItemProps {
  notification: Notification;
  onNotificationClick: (notification: Notification) => void;
  onActionComplete: (notification: Notification, event: React.MouseEvent) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onNotificationClick,
  onActionComplete,
}) => {
  return (
    <div 
      key={notification.id} 
      className={`border-b border-loro-pearl cursor-pointer hover:bg-gray-50 ${notification.read ? "bg-white" : "bg-loro-pearl/10"}`}
      onClick={() => onNotificationClick(notification)}
    >
      <div className="p-3 flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <NotificationIcon actionType={notification.actionType} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className="text-sm font-medium text-loro-navy line-clamp-1">{notification.title}</h4>
            <span className="text-xs text-gray-500 ml-1 flex-shrink-0">
              {formatNotificationTime(notification.timestamp)}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1 line-clamp-1">{notification.message}</p>
          
          {notification.type === 'action' && (
            <button 
              onClick={(e) => onActionComplete(notification, e)}
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
};
