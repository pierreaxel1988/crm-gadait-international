
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
}

const Navbar: React.FC<NavbarProps> = ({
  toggleSidebar,
  sidebarCollapsed
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Fetch sample notifications
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        title: 'New Lead',
        message: 'You have received a new lead from the website',
        read: false,
        timestamp: new Date(Date.now() - 30 * 60000)
      }, 
      {
        id: '2',
        title: 'Meeting Reminder',
        message: 'Client meeting in 1 hour',
        read: false,
        timestamp: new Date(Date.now() - 120 * 60000)
      }, 
      {
        id: '3',
        title: 'Task Completed',
        message: 'Document processing completed successfully',
        read: true,
        timestamp: new Date(Date.now() - 24 * 60 * 60000)
      }
    ];
    
    setNotifications(sampleNotifications);
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
