import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Calendar, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useNotifications } from '@/hooks/useNotifications';

const Notifications = () => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const navigate = useNavigate();
  const { notifications, markAllAsRead, handleActionComplete } = useNotifications();

  const getActionIcon = (actionType?: string) => {
    switch (actionType?.toLowerCase()) {
      case 'call':
      case 'email':
      case 'followup':
        return <Calendar size={16} className="text-gray-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
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
      return format(date, 'dd MMM yyyy', { locale: fr });
    }
  };

  const handleCompleteAction = async (notification) => {
    const success = await handleActionComplete(notification);
    if (success) {
      toast.success('Action marquée comme terminée');
    } else {
      toast.error("Impossible de marquer l'action comme terminée");
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.type === 'action' && notification.leadId) {
      navigate(`/leads/${notification.leadId}`);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Notifications</h1>
          {notifications.some(n => !n.read) && (
            <Button variant="ghost" onClick={markAllAsRead} className="text-loro-hazel">
              Tout marquer comme lu
            </Button>
          )}
        </div>

        <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)} className="mb-6">
          <TabsList className="w-full bg-gray-100 p-0.5 rounded-xl h-11">
            <TabsTrigger value="all" className="flex-1">
              Toutes
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex-1">
              Non lues
            </TabsTrigger>
            <TabsTrigger value="read" className="flex-1">
              Lues
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-1">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(notification => (
              <div 
                key={notification.id}
                className={`p-4 rounded-lg border ${notification.read ? 'bg-white' : 'bg-loro-pearl/10'} cursor-pointer`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(notification.actionType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium text-loro-navy line-clamp-1">
                        {notification.title}
                      </h4>
                      <span className="text-xs text-gray-500 ml-2">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    {notification.type === 'action' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 h-8 text-loro-hazel hover:text-loro-navy"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteAction(notification);
                        }}
                      >
                        <CheckCheck className="w-4 h-4 mr-1" />
                        Marquer comme terminée
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500">Aucune notification {filter !== 'all' ? 'dans cette catégorie' : ''}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Notifications;
