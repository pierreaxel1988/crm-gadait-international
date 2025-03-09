
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Menu, Moon, Search, Sun, User, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface NavbarProps {
  toggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

const Navbar = ({ toggleSidebar, sidebarCollapsed }: NavbarProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const isMobile = useIsMobile();

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
  };

  return (
    <nav className={cn(
      "sticky top-0 z-50 w-full bg-loro-white/80 backdrop-blur-md border-b border-loro-pearl transition-all duration-300",
    )}>
      <div className="content-container">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="mr-2 rounded-md p-2 text-loro-hazel hover:bg-loro-sand hover:text-loro-navy"
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-optima text-xl font-semibold tracking-tight text-loro-navy">Gadait</span>
              <span className="font-optima text-xs uppercase tracking-widest text-loro-hazel">International</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isSearchOpen ? (
              <div className="relative animate-fade-in">
                <input
                  type="text"
                  placeholder="Search..."
                  className="luxury-input w-full md:w-64 border-loro-pearl font-optima"
                  autoFocus
                  onBlur={() => setIsSearchOpen(false)}
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-loro-hazel hover:text-loro-navy"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="rounded-md p-2 text-loro-hazel hover:bg-loro-sand hover:text-loro-navy"
              >
                <Search size={20} />
              </button>
            )}

            <button
              onClick={toggleDarkMode}
              className="rounded-md p-2 text-loro-hazel hover:bg-loro-sand hover:text-loro-navy"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button className="relative rounded-md p-2 text-loro-hazel hover:bg-loro-sand hover:text-loro-navy">
              <Bell size={20} />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-loro-hazel"></span>
            </button>

            <button className="flex items-center space-x-2 rounded-md p-2 text-loro-hazel hover:bg-loro-sand hover:text-loro-navy">
              <User size={20} />
              <span className="hidden md:inline-block text-sm font-medium font-optima">Account</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
