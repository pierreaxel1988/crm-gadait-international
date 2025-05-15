
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Shield, User, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import AdminBadgeWrapper from '../AdminBadgeWrapper';
import CommercialBadgeWrapper from '../CommercialBadgeWrapper';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LogoProps {
  toggleSidebar?: () => void;
}

const Logo: React.FC<LogoProps> = ({ toggleSidebar }) => {
  const isMobile = useIsMobile();
  const { userRole } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  
  return (
    <div className="flex items-center">
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button 
            onClick={(e) => {
              e.preventDefault();
              if (toggleSidebar) toggleSidebar();
            }}
            aria-label="Toggle menu" 
            className={cn(
              "mr-2 rounded-md p-2 transition-colors duration-200 px-0 py-0 my-0",
              isMobile ? "text-white" : "text-white",
              menuOpen ? "bg-white/10" : ""
            )}
          >
            <Menu size={isMobile ? 18 : 20} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 mt-1">
          {userRole === 'admin' && (
            <>
              <DropdownMenuItem asChild>
                <Link to="/admin" className="w-full flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Administration</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin?tab=users" className="w-full flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Gestion des utilisateurs</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem asChild>
            <Link to="/profile" className="w-full flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Mon profil</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Link to="/" className="flex items-center">
        <Shield 
          className={cn(
            "mr-2", 
            isMobile ? "text-white h-4 w-4" : "text-white h-5 w-5"
          )} 
        />
        <span 
          className={cn(
            "font-futura tracking-tight uppercase", 
            "text-white text-base"
          )}
        >
          GADAIT.
        </span>
        {userRole === 'admin' && <AdminBadgeWrapper />}
        {userRole === 'commercial' && <CommercialBadgeWrapper />}
      </Link>
    </div>
  );
};

export default Logo;
