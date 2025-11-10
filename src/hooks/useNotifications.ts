import { useState, useEffect } from 'react';
import { useActionsData } from './useActionsData';
import { format, isPast, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
  actionId?: string;
  leadId?: string;
  type: 'action' | 'system' | 'hot_lead' | 'inactive_lead';
  actionType?: string;
  assignedToName?: string;
  metadata?: any;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [processedActionIds, setProcessedActionIds] = useState<Set<string>>(new Set());
  const [systemNotificationsShown, setSystemNotificationsShown] = useState<boolean>(false);
  const [notificationToastShown, setNotificationToastShown] = useState<boolean>(true); // Default to true to prevent initial toast
  const { actions, markActionComplete } = useActionsData();
  const { user, isAdmin, isCommercial, userRole } = useAuth();
  
  // Charger les notifications depuis Supabase
  useEffect(() => {
    if (!user) return;

    const fetchSupabaseNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      if (data && data.length > 0) {
        const supabaseNotifications: Notification[] = data.map((notif: any) => ({
          id: `db-${notif.id}`,
          title: notif.title,
          message: notif.message,
          read: notif.is_read,
          timestamp: new Date(notif.created_at),
          leadId: notif.lead_id,
          type: notif.type,
          metadata: notif.metadata
        }));

        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const newNotifs = supabaseNotifications.filter(n => !existingIds.has(n.id));
          return [...newNotifs, ...prev];
        });
      }
    };

    fetchSupabaseNotifications();

    // S'abonner aux changements en temps réel
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotif = payload.new as any;
          const notification: Notification = {
            id: `db-${newNotif.id}`,
            title: newNotif.title,
            message: newNotif.message,
            read: newNotif.is_read,
            timestamp: new Date(newNotif.created_at),
            leadId: newNotif.lead_id,
            type: newNotif.type,
            metadata: newNotif.metadata
          };

          setNotifications(prev => [notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
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
  
  const markAsRead = async (id: string) => {
    // Si c'est une notification de la base de données
    if (id.startsWith('db-')) {
      const dbId = id.replace('db-', '');
      await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', dbId);
    }

    setNotifications(notifications.map(notification => 
      notification.id === id ? {
        ...notification,
        read: true
      } : notification
    ));
  };

  const markAllAsRead = async () => {
    if (user) {
      // Marquer toutes les notifications de la base de données comme lues
      await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);
    }

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
