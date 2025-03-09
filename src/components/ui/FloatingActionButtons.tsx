
import React from 'react';
import { Plus, Phone, Mail } from 'lucide-react';
import CustomButton from './CustomButton';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface FloatingActionButtonsProps {
  onAddAction: () => void;
  onCall?: () => void;
  onMail?: () => void;
  phoneNumber?: string;
  email?: string;
  className?: string;
}

const FloatingActionButtons = ({
  onAddAction,
  onCall,
  onMail,
  phoneNumber,
  email,
  className
}: FloatingActionButtonsProps) => {
  const isMobile = useIsMobile();
  
  const handleCall = () => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    } else if (onCall) {
      onCall();
    }
  };
  
  const handleMail = () => {
    if (email) {
      window.location.href = `mailto:${email}`;
    } else if (onMail) {
      onMail();
    }
  };

  return (
    <div className={cn(
      "fixed bottom-6 right-6 flex flex-col gap-2 z-50",
      isMobile ? "gap-3" : "gap-2",
      className
    )}>
      <CustomButton
        variant="chocolate"
        className="rounded-full p-0 w-12 h-12 flex items-center justify-center shadow-luxury"
        onClick={onAddAction}
        title="Ajouter une action"
      >
        <Plus className="h-5 w-5" />
      </CustomButton>
      
      {(phoneNumber || onCall) && (
        <CustomButton
          variant="chocolate"
          className="rounded-full p-0 w-12 h-12 flex items-center justify-center shadow-luxury"
          onClick={handleCall}
          title="Appeler"
        >
          <Phone className="h-5 w-5" />
        </CustomButton>
      )}
      
      {(email || onMail) && (
        <CustomButton
          variant="chocolate"
          className="rounded-full p-0 w-12 h-12 flex items-center justify-center shadow-luxury"
          onClick={handleMail}
          title="Envoyer un email"
        >
          <Mail className="h-5 w-5" />
        </CustomButton>
      )}
    </div>
  );
};

export default FloatingActionButtons;
