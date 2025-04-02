
import React, { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const ThemeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const isMobile = useIsMobile();

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
  };

  return (
    <button 
      onClick={toggleDarkMode} 
      className="rounded-md p-1 md:p-2 text-loro-navy hover:text-loro-hazel transition-colors duration-200"
    >
      {isDarkMode ? (
        <Sun size={isMobile ? 18 : 20} />
      ) : (
        <Moon size={isMobile ? 18 : 20} />
      )}
    </button>
  );
};

export default ThemeToggle;
