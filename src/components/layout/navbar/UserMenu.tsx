
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const UserMenu: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

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

  return (
    <div className="flex items-center">
      <button className="flex items-center space-x-1 md:space-x-2 rounded-md p-1 md:p-2 text-loro-navy hover:text-loro-hazel transition-colors duration-200">
        <User size={isMobile ? 18 : 20} />
        <span className="hidden md:inline-block text-sm font-medium font-optima">
          {user?.email ? formatUsername(user.email) : 'Account'}
        </span>
      </button>
      
      <button 
        onClick={handleSignOut} 
        className="rounded-md p-1 md:p-2 text-loro-navy hover:text-loro-hazel transition-colors duration-200 ml-1" 
        title="Sign out"
      >
        <LogOut size={isMobile ? 18 : 20} />
      </button>
    </div>
  );
};

export default UserMenu;
