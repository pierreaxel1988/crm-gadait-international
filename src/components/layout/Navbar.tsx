
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import ImmersiveHeaderOverlay from './ImmersiveHeaderOverlay';

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
  const isMobile = useIsMobile();

  return (
    <>
      {isMobile && <ImmersiveHeaderOverlay />}
      <nav className={cn(
        "sticky top-0 z-40 w-full bg-loro-white border-b border-loro-pearl transition-all duration-300",
        isMobile && "bg-[#0A2540] text-white"
      )}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
          <div className={cn(
            "flex h-16 items-center justify-between",
            isMobile && "safe-area-top"
          )}>
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
    </>
  );
};

export default Navbar;
