
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Calendar, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useNotifications } from '@/hooks/useNotifications';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

const Notifications = () => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { notifications, markAllAsRead, handleActionComplete } = useNotifications();

  const getActionIcon = (actionType?: string) => {
    switch (actionType?.toLowerCase()) {
      case 'call':
      case 'email':
      case 'followup':
        return <Calendar size={isMobile ? 14 : 16} className="text-loro-terracotta" />;
      default:
        return <Bell size={isMobile ? 14 : 16} className="text-loro-terracotta" />;
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
      return format(date, isMobile ? 'dd/MM/yy' : 'dd MMM yyyy', { locale: fr });
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
      <SubNavigation />
      <div className="p-4 md:p-6 bg-white min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3">
            <h1 className="text-xl sm:text-2xl font-futuraLight tracking-wide text-loro-navy">Notifications</h1>
            {notifications.some(n => !n.read) && (
              <Button 
                variant="outline" 
                onClick={markAllAsRead} 
                size={isMobile ? "sm" : "default"}
                className="text-loro-terracotta border-loro-terracotta/70 hover:bg-loro-pearl/20 transition-all duration-200 w-full sm:w-auto"
              >
                Tout marquer comme lu
              </Button>
            )}
          </div>
          
          <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)} className="mb-4 md:mb-6">
            <TabsList className="w-full bg-loro-pearl/30 p-0.5 rounded-xl h-10 md:h-11">
              <TabsTrigger value="all" className="flex-1 text-xs md:text-sm text-loro-navy data-[state=active]:bg-white data-[state=active]:text-loro-terracotta data-[state=active]:shadow-luxury">
                Toutes
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex-1 text-xs md:text-sm text-loro-navy data-[state=active]:bg-white data-[state=active]:text-loro-terracotta data-[state=active]:shadow-luxury">
                Non lues
              </TabsTrigger>
              <TabsTrigger value="read" className="flex-1 text-xs md:text-sm text-loro-navy data-[state=active]:bg-white data-[state=active]:text-loro-terracotta data-[state=active]:shadow-luxury">
                Lues
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2.5 md:space-y-3.5">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map(notification => (
                <Card 
                  key={notification.id}
                  className={`p-3 sm:p-4 ${notification.read ? 'bg-white' : 'bg-loro-pearl/10'} hover:bg-loro-pearl/5 transition-all duration-200 cursor-pointer border border-loro-pearl/30 hover:border-loro-pearl/50 shadow-luxury`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-loro-pearl/30 flex items-center justify-center">
                        {getActionIcon(notification.actionType)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-1 sm:gap-2">
                        <h4 className="text-sm font-medium text-loro-navy line-clamp-1">
                          {notification.title}
                        </h4>
                        <span className="text-xs whitespace-nowrap text-loro-terracotta border border-loro-terracotta/70 bg-transparent rounded-full px-2 py-0.5 w-fit">
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-loro-navy/80 mt-1.5">
                        {notification.message}
                      </p>
                      {notification.type === 'action' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-2 h-7 sm:h-8 text-xs sm:text-sm text-loro-terracotta hover:text-loro-navy hover:bg-loro-pearl/20 transition-colors duration-200 px-2 sm:px-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteAction(notification);
                          }}
                        >
                          <CheckCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                          Marquer comme terminée
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="text-center py-10 md:py-14 bg-white border border-loro-pearl/20 shadow-luxury">
                <Bell className="mx-auto h-10 w-10 md:h-14 md:w-14 text-loro-sand mb-3 md:mb-4 opacity-70" />
                <p className="text-loro-navy/70 font-futuraLight">Aucune notification {filter !== 'all' ? 'dans cette catégorie' : ''}</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Notifications;
