import React, { useState } from 'react';
import { User, Settings, LogOut, Users } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
const UserMenu = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const {
    signOut,
    isAdmin
  } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Déconnexion réussie');
      navigate('/auth');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };
  const handleSettingsClick = () => {
    navigate('/settings');
  };
  const handleUsersManagementClick = () => {
    navigate('/admin');
  };
  return <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button className="rounded-md p-1.5">
                <User className="h-5 w-5 text-white" />
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          
        </Tooltip>
      </TooltipProvider>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleSettingsClick}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Paramètres</span>
        </DropdownMenuItem>
        
        {isAdmin && <DropdownMenuItem onClick={handleUsersManagementClick}>
            <Users className="mr-2 h-4 w-4" />
            <span>Gestion des utilisateurs</span>
          </DropdownMenuItem>}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>;
};
export default UserMenu;