
import React from 'react';
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

const Navbar: React.FC<NavbarProps> = ({
  toggleSidebar,
  sidebarCollapsed
}) => {
  return (
    <nav className={cn(
      "sticky top-0 z-50 w-full bg-loro-white border-b border-loro-pearl transition-all duration-300"
    )}>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 pt-[env(safe-area-inset-top)]">
        <div className="flex h-16 items-center justify-between">
          <Logo toggleSidebar={toggleSidebar} />

          <div className="flex items-center space-x-2 md:space-x-4">
            <SearchBar />
            <ThemeToggle />
            <NotificationsDropdown />
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
