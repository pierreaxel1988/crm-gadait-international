
import React from 'react';
import { User } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const UserMenu = () => {
  const isMobile = useIsMobile();
  
  return (
    <button className="rounded-md p-1.5 transition-colors duration-200">
      <User className="h-5 w-5 text-white" />
    </button>
  );
};

export default UserMenu;
