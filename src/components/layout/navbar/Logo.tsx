
import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import AdminBadgeWrapper from '../AdminBadgeWrapper';
import CommercialBadgeWrapper from '../CommercialBadgeWrapper';
import { useAuth } from '@/hooks/useAuth';

interface LogoProps {
  toggleSidebar?: () => void;
}

const Logo: React.FC<LogoProps> = ({ toggleSidebar }) => {
  const isMobile = useIsMobile();
  const { userRole } = useAuth();
  
  return (
    <div className="flex items-center">
      <button 
        onClick={toggleSidebar} 
        aria-label="Toggle menu" 
        className={cn(
          "mr-2 rounded-md p-2 transition-colors duration-200 px-0 py-0 my-0",
          isMobile ? "text-white" : "text-white"
        )}
      >
        <Menu size={isMobile ? 18 : 20} />
      </button>
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
