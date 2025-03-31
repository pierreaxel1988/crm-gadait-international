
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-loro-pearl">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center">
            <span className="font-futura text-3xl tracking-tight text-loro-navy uppercase">GADAIT.</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-sm mr-2 hidden md:block">
                {user.email}
                {isAdmin && <AdminBadge />}
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={handleAuth}
            >
              {user ? (
                <>
                  <LogOut size={16} />
                  <span className="hidden md:inline">Déconnexion</span>
                </>
              ) : (
                <>
                  <User size={16} />
                  <span className="hidden md:inline">Connexion</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
