
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Menu, Moon, Search, Sun, User, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border transition-all duration-300">
      <div className="content-container">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            {isMobile && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="mr-2 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-serif text-xl font-semibold tracking-tight">Gadait</span>
              <span className="font-sans text-xs uppercase tracking-widest text-muted-foreground">International</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isSearchOpen ? (
              <div className="relative animate-fade-in">
                <input
                  type="text"
                  placeholder="Search..."
                  className="luxury-input w-full md:w-64"
                  autoFocus
                  onBlur={() => setIsSearchOpen(false)}
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Search size={20} />
              </button>
            )}

            <button
              onClick={toggleDarkMode}
              className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button className="relative rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
              <Bell size={20} />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary"></span>
            </button>

            <button className="flex items-center space-x-2 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
              <User size={20} />
              <span className="hidden md:inline-block text-sm font-medium">Account</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
