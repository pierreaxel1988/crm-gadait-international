
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
  
  // WhatsApp handler
  const handleWhatsApp = () => {
    if (phoneNumber) {
      const cleanedPhone = phoneNumber.replace(/[^\d+]/g, '');
      window.open(`https://wa.me/${cleanedPhone}`, '_blank');
    }
    setIsExpanded(false);
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
                  className="h-12 w-12 rounded-full bg-loro-100 text-chocolate-dark border border-white hover:bg-loro-200 flex items-center justify-center shadow-md"
                  onClick={handleCall}
                  title="Appeler"
                >
                  <Phone className="h-5 w-5" />
                </button>
              </div>
            )}
            
            {(phoneNumber) && (
              <div className="flex items-center gap-3 animate-fade-in">
                <span className="bg-white/90 px-3 py-1 rounded-full text-sm shadow-sm">
                  WhatsApp
                </span>
                <button
                  className="h-12 w-12 rounded-full bg-loro-100 text-chocolate-dark border border-white hover:bg-loro-200 flex items-center justify-center shadow-md"
                  onClick={handleWhatsApp}
                  title="WhatsApp"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                    <path d="M9 10a.5.5 0 0 1 1 0c0 1.97 1.53 3.5 3.5 3.5a.5.5 0 0 1 0 1c-2.47 0-4.5-2.02-4.5-4.5" />
                  </svg>
                </button>
              </div>
            )}
            
            {(email || onMail) && (
              <div className="flex items-center gap-3 animate-fade-in">
                <span className="bg-white/90 px-3 py-1 rounded-full text-sm shadow-sm">
                  Envoyer un email
                </span>
                <button
                  className="h-12 w-12 rounded-full bg-loro-100 text-chocolate-dark border border-white hover:bg-loro-200 flex items-center justify-center shadow-md"
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
                className="h-12 w-12 rounded-full bg-loro-100 text-chocolate-dark border border-white hover:bg-loro-200 flex items-center justify-center shadow-md"
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
        <>
          <button
            className="h-12 w-12 rounded-full bg-loro-100 text-chocolate-dark border border-white hover:bg-loro-200 flex items-center justify-center shadow-md"
            onClick={handleCall}
            title="Appeler"
          >
            <Phone className="h-5 w-5" />
          </button>
          
          {phoneNumber && (
            <button
              className="h-12 w-12 rounded-full bg-loro-100 text-chocolate-dark border border-white hover:bg-loro-200 flex items-center justify-center shadow-md"
              onClick={handleWhatsApp}
              title="WhatsApp"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                <path d="M9 10a.5.5 0 0 1 1 0c0 1.97 1.53 3.5 3.5 3.5a.5.5 0 0 1 0 1c-2.47 0-4.5-2.02-4.5-4.5" />
              </svg>
            </button>
          )}
        </>
      )}
      
      {(email || onMail) && (
        <button
          className="h-12 w-12 rounded-full bg-loro-100 text-chocolate-dark border border-white hover:bg-loro-200 flex items-center justify-center shadow-md"
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
