import React, { useState } from 'react';
import { Plus, Phone, Mail, X } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleCall = () => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    } else if (onCall) {
      onCall();
    }
    setIsExpanded(false);
  };
  
  const handleMail = () => {
    if (email) {
      window.location.href = `mailto:${email}`;
    } else if (onMail) {
      onMail();
    }
    setIsExpanded(false);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (isMobile) {
    return (
      <div className={cn(
        "fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50",
        className
      )}>
        {isExpanded && (
          <>
            {(phoneNumber || onCall) && (
              <div className="flex items-center gap-3 animate-fade-in">
                <span className="bg-white/90 px-3 py-1 rounded-full text-sm shadow-sm">
                  Appeler
                </span>
                <CustomButton
                  variant="chocolate"
                  className="rounded-full p-0 w-12 h-12 flex items-center justify-center shadow-luxury"
                  onClick={handleCall}
                  title="Appeler"
                >
                  <Phone className="h-5 w-5" />
                </CustomButton>
              </div>
            )}
            
            {(email || onMail) && (
              <div className="flex items-center gap-3 animate-fade-in">
                <span className="bg-white/90 px-3 py-1 rounded-full text-sm shadow-sm">
                  Envoyer un email
                </span>
                <CustomButton
                  variant="chocolate"
                  className="rounded-full p-0 w-12 h-12 flex items-center justify-center shadow-luxury"
                  onClick={handleMail}
                  title="Envoyer un email"
                >
                  <Mail className="h-5 w-5" />
                </CustomButton>
              </div>
            )}
            
            <div className="flex items-center gap-3 animate-fade-in">
              <span className="bg-white/90 px-3 py-1 rounded-full text-sm shadow-sm">
                Ajouter une action
              </span>
              <CustomButton
                variant="chocolate"
                className="rounded-full p-0 w-12 h-12 flex items-center justify-center shadow-luxury"
                onClick={() => {
                  onAddAction();
                  setIsExpanded(false);
                }}
                title="Ajouter une action"
              >
                <Plus className="h-5 w-5" />
              </CustomButton>
            </div>
          </>
        )}
        
        <CustomButton
          variant={isExpanded ? "outline" : "chocolate"}
          className={cn(
            "rounded-full p-0 w-14 h-14 flex items-center justify-center shadow-luxury transition-all",
            isExpanded ? "bg-white border-chocolate-dark" : ""
          )}
          onClick={toggleExpand}
          title={isExpanded ? "Fermer" : "Actions"}
        >
          {isExpanded ? (
            <X className="h-6 w-6 text-chocolate-dark" />
          ) : (
            <Plus className="h-6 w-6" />
          )}
        </CustomButton>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "fixed bottom-6 right-6 flex flex-col gap-2 z-50",
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
