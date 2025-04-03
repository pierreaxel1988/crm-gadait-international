
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';

export const CommercialBadge = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  // Extract the first name from the email
  const getFirstName = () => {
    if (!user?.email) return "COMMERCIAL";
    
    // Extract username from email (part before @)
    const username = user.email.split('@')[0];
    
    // Get first name (usually before dots, underscores or hyphens)
    const firstName = username.split(/[._-]/)[0];
    
    // Capitalize first letter
    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
  };
  
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
      font-futuraMd
    `}>
      {getFirstName()}
    </Badge>
  );
};
