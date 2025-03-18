
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

export const AdminBadge = () => {
  const isMobile = useIsMobile();
  
  return (
    <Badge className={`
      text-[#F5F5F0] 
      border-0 
      ${isMobile ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'} 
      rounded-full 
      font-medium 
      bg-loro-terracotta 
      hover:bg-loro-terracotta/90
      hover:text-[#F5F5F0]
      shadow-sm
      transition-all
      duration-200
    `}>
      {isMobile ? 'ADM' : 'ADMIN'}
    </Badge>
  );
};
