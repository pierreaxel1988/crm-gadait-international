
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Bell, Moon, LogOut, Search, User, Menu, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminBadge } from '@/components/ui/admin-badge';

const Navbar = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleAuth = () => {
    if (user) {
      signOut().then(() => {
        navigate('/auth');
      });
    } else {
      navigate('/auth');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-loro-white shadow-sm border-b border-loro-pearl">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <Menu className="h-6 w-6 mr-3 text-loro-navy" />
            <Link to="/" className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-loro-hazel" />
              <span className="font-futura text-2xl tracking-tight text-loro-navy">GADAIT.</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-5">
            <Search className="h-5 w-5 text-loro-navy" />
            <Moon className="h-5 w-5 text-loro-navy" />
            <div className="relative">
              <Bell className="h-5 w-5 text-loro-navy" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                2
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full"
              onClick={handleAuth}
            >
              <User className="h-5 w-5 text-loro-navy" />
              {isAdmin && <span className="sr-only">Admin</span>}
            </Button>
            <LogOut className="h-5 w-5 text-loro-navy cursor-pointer" onClick={handleAuth} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
