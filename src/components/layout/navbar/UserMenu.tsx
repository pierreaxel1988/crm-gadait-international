
import React from 'react';
import { User } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';

const UserMenu = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  const handleUserMenuClick = () => {
    // Rediriger vers la page de profil ou afficher un menu déroulant
    console.log('User menu clicked');
    navigate('/settings'); // Redirection vers les paramètres utilisateur
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            onClick={handleUserMenuClick} 
            className="rounded-md p-1.5 transition-colors duration-200 hover:bg-white/10"
          >
            <User className="h-5 w-5 text-white" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Profil utilisateur</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default UserMenu;
