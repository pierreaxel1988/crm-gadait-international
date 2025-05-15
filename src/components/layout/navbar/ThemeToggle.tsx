
import React, { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ThemeToggle = () => {
  const isMobile = useIsMobile();
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Implémentation future du changement de thème
    console.log('Theme toggled:', isDarkMode ? 'light' : 'dark');
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            onClick={toggleTheme} 
            className="rounded-md p-1.5 transition-colors duration-200 hover:bg-white/10"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-white" />
            ) : (
              <Moon className="h-5 w-5 text-white" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{isDarkMode ? 'Mode clair' : 'Mode sombre'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ThemeToggle;
