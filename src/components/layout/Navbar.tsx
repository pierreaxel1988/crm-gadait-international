
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Import newly created components
import Logo from './navbar/Logo';
import SearchBar from './navbar/SearchBar';
import ThemeToggle from './navbar/ThemeToggle';
import NotificationsDropdown from './navbar/NotificationsDropdown';
import UserMenu from './navbar/UserMenu';

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
  actionId?: string;
  leadId?: string;
  type: 'action' | 'system';
}

const Navbar: React.FC<NavbarProps> = ({
  toggleSidebar,
  sidebarCollapsed
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Only add system notifications at initial load
  useEffect(() => {
    // Add a few system notifications for things like platform updates
    const systemNotifications: Notification[] = [
      {
        id: 'system-1',
        title: 'Bienvenue sur Loro CRM',
        message: 'Découvrez les nouvelles fonctionnalités de la plateforme',
        read: false,
        timestamp: new Date(Date.now() - 30 * 60000),
        type: 'system'
      }
    ];
    
    setNotifications(systemNotifications);
  }, []);

  return (
    <nav className={cn(
      "sticky top-0 z-50 w-full bg-loro-white border-b border-loro-pearl transition-all duration-300"
    )}>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <Logo toggleSidebar={toggleSidebar} />

          <div className="flex items-center space-x-2 md:space-x-4">
            <SearchBar />
            <ThemeToggle />
            <NotificationsDropdown 
              notifications={notifications} 
              setNotifications={setNotifications} 
            />
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
