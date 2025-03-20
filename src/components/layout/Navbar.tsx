import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, LogOut, Menu, Moon, Search, Shield, Sun, User, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import AdminBadgeWrapper from './AdminBadgeWrapper';

interface NavbarProps {
  toggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
}

const Navbar = ({
  toggleSidebar,
  sidebarCollapsed
}: NavbarProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const isMobile = useIsMobile();
  const {
    user,
    signOut
  } = useAuth();

  useEffect(() => {
    const sampleNotifications: Notification[] = [{
      id: '1',
      title: 'New Lead',
      message: 'You have received a new lead from the website',
      read: false,
      timestamp: new Date(Date.now() - 30 * 60000)
    }, {
      id: '2',
      title: 'Meeting Reminder',
      message: 'Client meeting in 1 hour',
      read: false,
      timestamp: new Date(Date.now() - 120 * 60000)
    }, {
      id: '3',
      title: 'Task Completed',
      message: 'Document processing completed successfully',
      read: true,
      timestamp: new Date(Date.now() - 24 * 60 * 60000)
    }];
    setNotifications(sampleNotifications);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => notification.id === id ? {
      ...notification,
      read: true
    } : notification));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })));
    toast.success('All notifications marked as read');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Successfully signed out');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const formatUsername = (email: string) => {
    const username = email.split('@')[0];
    return username.split(/[._-]/).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
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

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return <nav className={cn("sticky top-0 z-50 w-full bg-loro-white border-b border-loro-pearl transition-all duration-300")}>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <button onClick={toggleSidebar} aria-label="Toggle menu" className="mr-2 rounded-md p-2 transition-colors duration-200 px-0 py-0 text-loro-navy my-0">
              <Menu size={isMobile ? 18 : 20} />
            </button>
            <Link to="/" className="flex items-center">
              <Shield className={cn("text-loro-hazel mr-2", isMobile ? "h-4 w-4" : "h-5 w-5")} />
              <span className={cn("font-futura tracking-tight text-loro-navy uppercase", 
                isMobile ? "text-base font-bold" : "text-sm")}>
                {isMobile ? "GADAIT" : "GADAIT. INTERNATIONAL"}
              </span>
              <AdminBadgeWrapper />
            </Link>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {isSearchOpen ? <div className="relative animate-fade-in">
                <input type="text" placeholder="Search..." className="luxury-input w-full md:w-64 border-loro-pearl font-optima" autoFocus onBlur={() => setIsSearchOpen(false)} />
                <button onClick={() => setIsSearchOpen(false)} className="absolute right-2 top-1/2 -translate-y-1/2 text-loro-hazel hover:text-loro-navy">
                  <X size={isMobile ? 14 : 16} />
                </button>
              </div> : <button onClick={() => setIsSearchOpen(true)} className="rounded-md p-1 md:p-2 text-loro-navy hover:text-loro-hazel transition-colors duration-200">
                <Search size={isMobile ? 18 : 20} />
              </button>}

            <button onClick={toggleDarkMode} className="rounded-md p-1 md:p-2 text-loro-navy hover:text-loro-hazel transition-colors duration-200">
              {isDarkMode ? <Sun size={isMobile ? 18 : 20} /> : <Moon size={isMobile ? 18 : 20} />}
            </button>

            <div className="relative">
              <button onClick={toggleNotifications} className="relative rounded-md p-1 md:p-2 text-loro-navy hover:text-loro-hazel transition-colors duration-200" aria-label="Notifications">
                <Bell size={isMobile ? 18 : 20} />
                {unreadCount > 0 && <span className="absolute right-0 top-0 h-3 w-3 md:h-4 md:w-4 rounded-full bg-loro-terracotta text-[#F5F5F0] flex items-center justify-center text-[8px] md:text-xs font-semibold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>}
              </button>
              
              {showNotifications && <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-10 border border-loro-pearl">
                  <div className="p-4 border-b border-loro-pearl flex justify-between items-center">
                    <h3 className="text-loro-navy font-medium">Notifications</h3>
                    {unreadCount > 0 && <button onClick={markAllAsRead} className="text-xs text-loro-hazel hover:underline">
                        Mark all as read
                      </button>}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(notification => <div key={notification.id} className={cn("p-4 border-b border-loro-pearl cursor-pointer hover:bg-gray-50", notification.read ? "bg-white" : "bg-loro-pearl/10")} onClick={() => markAsRead(notification.id)}>
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-medium text-loro-navy">{notification.title}</h4>
                            <span className="text-xs text-gray-500">{formatTime(notification.timestamp)}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                        </div>) : <p className="p-4 text-center text-gray-500 text-sm">No notifications</p>}
                  </div>
                  <div className="p-2 border-t border-loro-pearl bg-gray-50">
                    <button className="w-full text-center text-xs text-loro-hazel hover:underline py-1">
                      View all notifications
                    </button>
                  </div>
                </div>}
            </div>

            <div className="flex items-center">
              <button className="flex items-center space-x-1 md:space-x-2 rounded-md p-1 md:p-2 text-loro-navy hover:text-loro-hazel transition-colors duration-200">
                <User size={isMobile ? 18 : 20} />
                <span className="hidden md:inline-block text-sm font-medium font-optima">
                  {user?.email ? formatUsername(user.email) : 'Account'}
                </span>
              </button>
              
              <button onClick={handleSignOut} className="rounded-md p-1 md:p-2 text-loro-navy hover:text-loro-hazel transition-colors duration-200 ml-1" title="Sign out">
                <LogOut size={isMobile ? 18 : 20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>;
};

export default Navbar;
