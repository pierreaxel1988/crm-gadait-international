
import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import AdminBadgeWrapper from '../AdminBadgeWrapper';

interface LogoProps {
  toggleSidebar?: () => void;
}

const Logo: React.FC<LogoProps> = ({ toggleSidebar }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex items-center">
      <button 
        onClick={toggleSidebar} 
        aria-label="Toggle menu" 
        className="mr-2 rounded-md p-2 transition-colors duration-200 px-0 py-0 text-loro-navy my-0"
      >
        <Menu size={isMobile ? 18 : 20} />
      </button>
      <Link to="/" className="flex items-center">
        <Shield 
          className={cn(
            "text-loro-hazel mr-2", 
            isMobile ? "h-4 w-4" : "h-5 w-5"
          )} 
        />
        <span 
          className={cn(
            "font-futura tracking-tight text-loro-navy uppercase", 
            isMobile ? "text-base" : "text-sm"
          )}
        >
          {isMobile ? "GADAIT." : "GADAIT. INTERNATIONAL"}
        </span>
        <AdminBadgeWrapper />
      </Link>
    </div>
  );
};

export default Logo;
