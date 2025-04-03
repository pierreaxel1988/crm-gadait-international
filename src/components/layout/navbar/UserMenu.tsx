
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, ChevronDown, Users } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const UserMenu: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user, signOut, isAdmin, userRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const formatUsername = (email: string) => {
    const username = email.split('@')[0];
    return username.split(/[._-]/).map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Successfully signed out');
      navigate('/auth');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex items-center" ref={menuRef}>
      <div className="relative">
        <button 
          className="flex items-center space-x-1 md:space-x-2 rounded-md p-1 md:p-2 text-loro-navy hover:text-loro-hazel transition-colors duration-200"
          onClick={() => setIsOpen(!isOpen)}
        >
          <User size={isMobile ? 18 : 20} />
          <span className="hidden md:inline-block text-sm font-medium font-optima">
            {user?.email ? formatUsername(user.email) : 'Account'}
          </span>
          <ChevronDown size={isMobile ? 16 : 18} />
        </button>
        
        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center px-4 py-2 text-sm text-loro-navy hover:bg-gray-100"
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                >
                  <Users className="mr-2" size={16} />
                  Gérer les utilisateurs
                </Link>
              )}
              <button
                onClick={() => {
                  handleSignOut();
                  setIsOpen(false);
                }}
                className="flex w-full items-center px-4 py-2 text-sm text-loro-navy hover:bg-gray-100"
                role="menuitem"
              >
                <LogOut className="mr-2" size={16} />
                Se déconnecter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMenu;
