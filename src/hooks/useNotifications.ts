
import { useState, useEffect } from 'react';
import { useActionsData } from './useActionsData';
import { format, isPast, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';

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
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { actions, markActionComplete } = useActionsData();
  
  useEffect(() => {
    // Add a few system notifications for things like platform updates
    const systemNotifications: Notification[] = [
      {
        id: 'system-1',
        title: 'Bienvenue sur le CRM Gadait International',
        message: 'Découvrez les nouvelles fonctionnalités de la plateforme',
        read: false,
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
  }, []);
  
  useEffect(() => {
    if (actions && actions.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const relevantActions = actions.filter(action => {
        if (action.status === 'done') return false;
        
        const scheduledDate = action.scheduledDate ? new Date(action.scheduledDate) : null;
        if (!scheduledDate) return false;
        
        const isActionToday = isToday(scheduledDate);
        const isActionOverdue = isPast(scheduledDate) && !isToday(scheduledDate);
        
        return isActionToday || isActionOverdue;
      });
      
      const actionNotifications: Notification[] = relevantActions.map(action => {
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
          actionType: action.actionType
        };
      });
      
      const existingActionIds = notifications
        .filter(n => n.type === 'action')
        .map(n => n.actionId);
        
      const newActionNotifications = actionNotifications
        .filter(n => !existingActionIds.includes(n.actionId));
      
      if (newActionNotifications.length > 0) {
        setNotifications(prev => [...newActionNotifications, ...prev]);
      }
    }
  }, [actions, notifications]);
  
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

  return {
    notifications,
    setNotifications,
    markAsRead,
    markAllAsRead,
    handleActionComplete,
    unreadCount: notifications.filter(notification => !notification.read).length
  };
};
