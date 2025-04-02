import React, { useState, useRef, useEffect } from 'react';
import { Bell, Calendar, Clock, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useActionsData } from '@/hooks/useActionsData';
import { ActionItem } from '@/types/actionHistory';
import { format, isPast, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
  actionId?: string;
  leadId?: string;
  type: 'action' | 'system';
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
  const { actions, markActionComplete } = useActionsData();
  const navigate = useNavigate();
  
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
          type: 'action'
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
  }, [actions, setNotifications]);
  
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
    toast.success('Toutes les notifications ont été marquées comme lues');
  };
  
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.type === 'action' && notification.leadId) {
      setShowNotifications(false);
      navigate(`/leads/${notification.leadId}`);
    }
  };
  
  const handleActionComplete = async (notification: Notification, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (notification.type === 'action' && notification.actionId) {
      try {
        await markActionComplete(notification.actionId, notification.leadId || '');
        
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        
        toast.success('Action marquée comme terminée');
      } catch (error) {
        console.error("Error completing action from notification:", error);
        toast.error("Impossible de marquer l'action comme terminée");
      }
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
                Tout marquer comme lu
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-4 border-b border-loro-pearl cursor-pointer hover:bg-gray-50 ${notification.read ? "bg-white" : "bg-loro-pearl/10"}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium text-loro-navy">{notification.title}</h4>
                    <span className="text-xs text-gray-500">{formatTime(notification.timestamp)}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                  
                  {notification.type === 'action' && (
                    <button 
                      onClick={(e) => handleActionComplete(notification, e)}
                      className="mt-2 flex items-center text-xs text-loro-hazel hover:text-loro-navy"
                    >
                      <CheckCheck size={12} className="mr-1" />
                      Marquer comme terminée
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="p-4 text-center text-gray-500 text-sm">Aucune notification</p>
            )}
          </div>
          
          <div className="p-2 border-t border-loro-pearl bg-gray-50">
            <button className="w-full text-center text-xs text-loro-hazel hover:underline py-1">
              Voir toutes les notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
