
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

export const AdminBadge = () => {
  const isMobile = useIsMobile();
  
  return (
    <Badge className={`
      text-[#8B6F4E] 
      border-0 
      ${isMobile ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-0.5 text-xs'} 
      rounded-full 
      font-medium 
      bg-[#F3EFE2]
      hover:bg-[#EAE4D3]
      ml-2
      tracking-wider
      shadow-sm
      transition-all
      duration-200
    `}>
      {isMobile ? 'ADM' : 'ADMIN'}
    </Badge>
  );
};
