
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
                <button
                  className="h-12 w-12 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center shadow-md"
                  onClick={handleCall}
                  title="Appeler"
                >
                  <Phone className="h-5 w-5" />
                </button>
              </div>
            )}
            
            {(email || onMail) && (
              <div className="flex items-center gap-3 animate-fade-in">
                <span className="bg-white/90 px-3 py-1 rounded-full text-sm shadow-sm">
                  Envoyer un email
                </span>
                <button
                  className="h-12 w-12 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center shadow-md"
                  onClick={handleMail}
                  title="Envoyer un email"
                >
                  <Mail className="h-5 w-5" />
                </button>
              </div>
            )}
            
            <div className="flex items-center gap-3 animate-fade-in">
              <span className="bg-white/90 px-3 py-1 rounded-full text-sm shadow-sm">
                Ajouter une action
              </span>
              <button
                className="h-12 w-12 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center shadow-md"
                onClick={() => {
                  onAddAction();
                  setIsExpanded(false);
                }}
                title="Ajouter une action"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </>
        )}
        
        <button
          className={cn(
            "h-14 w-14 rounded-full flex items-center justify-center shadow-md transition-all",
            isExpanded 
              ? "bg-white text-gray-800 border border-gray-200" 
              : "bg-gray-800 text-white"
          )}
          onClick={toggleExpand}
          title={isExpanded ? "Fermer" : "Actions"}
        >
          {isExpanded ? (
            <X className="h-6 w-6" />
          ) : (
            <Plus className="h-6 w-6" />
          )}
        </button>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "fixed bottom-6 right-6 flex flex-col gap-2 z-50",
      className
    )}>
      <button
        className="h-12 w-12 rounded-full bg-gray-800 text-white flex items-center justify-center shadow-md hover:bg-gray-700"
        onClick={onAddAction}
        title="Ajouter une action"
      >
        <Plus className="h-5 w-5" />
      </button>
      
      {(phoneNumber || onCall) && (
        <button
          className="h-12 w-12 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center shadow-md"
          onClick={handleCall}
          title="Appeler"
        >
          <Phone className="h-5 w-5" />
        </button>
      )}
      
      {(email || onMail) && (
        <button
          className="h-12 w-12 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center shadow-md"
          onClick={handleMail}
          title="Envoyer un email"
        >
          <Mail className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default FloatingActionButtons;
