
import { useState, useEffect } from 'react';
import { useActionsData } from './useActionsData';
import { format, isPast, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
  actionId?: string;
  leadId?: string;
  type: 'action' | 'system';
  actionType?: string;
  assignedToName?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [processedActionIds, setProcessedActionIds] = useState<Set<string>>(new Set());
  const [systemNotificationsShown, setSystemNotificationsShown] = useState<boolean>(false);
  const [notificationToastShown, setNotificationToastShown] = useState<boolean>(true); // Default to true to prevent initial toast
  const { actions, markActionComplete } = useActionsData();
  const { user, isAdmin, isCommercial, userRole } = useAuth();
  
  // Load system notifications only once and don't show them by default
  useEffect(() => {
    if (!systemNotificationsShown) {
      const systemNotifications: Notification[] = [
        {
          id: 'system-1',
          title: 'Bienvenue sur le CRM Gadait International',
          message: 'Découvrez les nouvelles fonctionnalités de la plateforme',
          read: true, // Mark as read by default
          timestamp: new Date(Date.now() - 30 * 60000),
          type: 'system'
        }
      ];
      
      setNotifications(prev => {
        const existingIds = prev.map(n => n.id);
        return [
          ...prev,
          ...systemNotifications.filter(n => !existingIds.includes(n.id))
        ];
      });
      
      setSystemNotificationsShown(true);
    }
  }, [systemNotificationsShown]);
  
  // Process action notifications with deduplication but limit frequency
  useEffect(() => {
    if (actions && actions.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const relevantActions = actions.filter(action => {
        if (action.status === 'done' || !action.id) return false;
        if (processedActionIds.has(action.id)) return false;
        
        const scheduledDate = action.scheduledDate ? new Date(action.scheduledDate) : null;
        if (!scheduledDate) return false;
        
        // For commercial users, only show their own actions
        if (isCommercial && user && action.assignedToName) {
          const userEmail = user.email?.toLowerCase();
          // Check if the action is assigned to the current user
          // This is a simple check - in production you might want to map emails to assignedToName more robustly
          const isAssignedToCurrentUser = userEmail && action.assignedToName.toLowerCase().includes(userEmail.split('@')[0].toLowerCase());
          if (!isAssignedToCurrentUser) return false;
        }
        
        const isActionToday = isToday(scheduledDate);
        const isActionOverdue = isPast(scheduledDate) && !isToday(scheduledDate);
        
        return isActionToday || isActionOverdue;
      });
      
      if (relevantActions.length === 0) return;
      
      // Track which action IDs we've processed to avoid duplicates
      const newProcessedIds = new Set(processedActionIds);
      
      const actionNotifications: Notification[] = relevantActions.map(action => {
        newProcessedIds.add(action.id);
        
        const scheduledDate = new Date(action.scheduledDate || new Date());
        const isOverdue = isPast(scheduledDate) && !isToday(scheduledDate);
        
        let title = '';
        let message = '';
        
        if (isOverdue) {
          title = `Action en retard : ${action.actionType}`;
          message = `${action.leadName} - Prévue le ${format(scheduledDate, 'dd/MM/yyyy', { locale: fr })}`;
        } else {
          title = `Action aujourd'hui : ${action.actionType}`;
          message = `${action.leadName} - ${format(scheduledDate, 'HH:mm', { locale: fr })}`;
        }
        
        return {
          id: `action-${action.id}`,
          title,
          message,
          read: false,
          timestamp: scheduledDate,
          actionId: action.id,
          leadId: action.leadId,
          type: 'action',
          actionType: action.actionType,
          assignedToName: action.assignedToName
        };
      });
      
      // Update the processed action IDs
      setProcessedActionIds(newProcessedIds);
      
      // Add only the new notifications
      if (actionNotifications.length > 0) {
        setNotifications(prev => [...actionNotifications, ...prev]);
      }
    }
  }, [actions, processedActionIds, isCommercial, user]);
  
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
  };
  
  const handleActionComplete = async (notification: Notification) => {
    if (notification.type === 'action' && notification.actionId) {
      try {
        await markActionComplete(notification.actionId, notification.leadId || '');
        
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        
        return true;
      } catch (error) {
        console.error("Error completing action from notification:", error);
        return false;
      }
    }
    return false;
  };

  const sortedNotifications = notifications.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return {
    notifications: sortedNotifications,
    setNotifications,
    markAsRead,
    markAllAsRead,
    handleActionComplete,
    unreadCount: notifications.filter(notification => !notification.read).length
  };
};
