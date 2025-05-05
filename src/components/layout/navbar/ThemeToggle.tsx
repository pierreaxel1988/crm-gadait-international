
import React from 'react';
import { Moon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const ThemeToggle = () => {
  const isMobile = useIsMobile();
  
  return (
    <button className="rounded-md p-1.5 transition-colors duration-200">
      <Moon className="h-5 w-5 text-white" />
    </button>
  );
};

export default ThemeToggle;
