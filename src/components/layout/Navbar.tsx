
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, LogOut, Menu, Moon, Search, Sun, User, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface NavbarProps {
  toggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

const Navbar = ({
  toggleSidebar,
  sidebarCollapsed
}: NavbarProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const isMobile = useIsMobile();
  const { user, logout } = useAuth();

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
  };

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success('Successfully signed out');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  return <nav className={cn("sticky top-0 z-50 w-full bg-loro-white border-b border-loro-pearl transition-all duration-300")}>
      <div className="content-container">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <button onClick={toggleSidebar} aria-label="Toggle menu" className="mr-2 rounded-md p-2 transition-colors duration-200 px-0 py-0 text-loro-navy my-0">
              <Menu size={20} />
            </button>
            <Link to="/" className="flex items-center">
              <span className="font-futura text-xl tracking-tight text-loro-navy uppercase">GADAIT.</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isSearchOpen ? <div className="relative animate-fade-in">
                <input type="text" placeholder="Search..." className="luxury-input w-full md:w-64 border-loro-pearl font-optima" autoFocus onBlur={() => setIsSearchOpen(false)} />
                <button onClick={() => setIsSearchOpen(false)} className="absolute right-2 top-1/2 -translate-y-1/2 text-loro-hazel hover:text-loro-navy">
                  <X size={16} />
                </button>
              </div> : <button onClick={() => setIsSearchOpen(true)} className="rounded-md p-2 text-loro-navy hover:text-loro-hazel transition-colors duration-200">
                <Search size={20} />
              </button>}

            <button onClick={toggleDarkMode} className="rounded-md p-2 text-loro-navy hover:text-loro-hazel transition-colors duration-200">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button className="relative rounded-md p-2 text-loro-navy hover:text-loro-hazel transition-colors duration-200">
              <Bell size={20} />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-loro-hazel"></span>
            </button>

            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 rounded-md p-2 text-loro-navy hover:text-loro-hazel transition-colors duration-200">
                <User size={20} />
                <span className="hidden md:inline-block text-sm font-medium font-optima">
                  {user?.email ? user.email.split('@')[0] : 'Account'}
                </span>
              </button>
              
              <button 
                onClick={handleSignOut}
                className="rounded-md p-2 text-loro-navy hover:text-loro-hazel transition-colors duration-200"
                title="Sign out"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>;
};

export default Navbar;
