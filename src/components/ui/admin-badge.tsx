
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

export const AdminBadge = () => {
  const isMobile = useIsMobile();
  
  return (
    <Badge className={`
      text-[#8B6F4E] 
      border-0 
      ${isMobile ? 'px-3 py-0.5 text-xs' : 'px-3 py-0.5 text-xs'} 
      rounded-full 
      font-medium 
      bg-[#F3EFE2]
      hover:bg-[#EAE4D3]
      ml-2
      tracking-wider
      uppercase
      shadow-sm
      transition-all
      duration-200
      font-futura
    `}>
      ADMIN
    </Badge>
  );
};
