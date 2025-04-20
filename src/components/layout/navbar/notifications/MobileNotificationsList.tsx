
import React from 'react';
import { Bell } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Notification } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';

interface MobileNotificationsListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onActionComplete: (notification: Notification, event: React.MouseEvent) => void;
  onMarkAllAsRead: () => void;
  onViewAll: () => void;
  unreadCount: number;
}

export const MobileNotificationsList: React.FC<MobileNotificationsListProps> = ({
  open,
  onOpenChange,
  notifications,
  onNotificationClick,
  onActionComplete,
  onMarkAllAsRead,
  onViewAll,
  unreadCount,
}) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] flex flex-col">
        <DrawerHeader className="sticky top-0 z-10 bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <DrawerTitle className="text-lg font-medium">Notifications</DrawerTitle>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onMarkAllAsRead} 
              className="text-sm text-loro-hazel"
            >
              Tout marquer comme lu
            </Button>
          )}
        </DrawerHeader>
        
        <div className="flex-1 overflow-y-auto">
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
            onClick={onViewAll}
          >
            Voir toutes les notifications
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
