
import React from 'react';
import { Phone, Mail } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LeadContactActionsProps {
  phone?: string;
  email?: string;
  handlePhoneCall: (e: React.MouseEvent) => void;
  handleWhatsAppClick: (e: React.MouseEvent) => void;
  handleEmailClick: (e: React.MouseEvent) => void;
}

const LeadContactActions: React.FC<LeadContactActionsProps> = ({
  phone,
  email,
  handlePhoneCall,
  handleWhatsAppClick,
  handleEmailClick
}) => {
  return (
    <div className="flex items-center gap-1.5">
      <TooltipProvider>
        {phone && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handlePhoneCall} 
                  className="h-7 w-7 flex items-center justify-center rounded-full bg-loro-100 text-chocolate-dark border border-white hover:bg-loro-200 transition-colors" 
                  aria-label="Appeler"
                >
                  <Phone className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Appeler</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleWhatsAppClick} 
                  className="h-7 w-7 flex items-center justify-center rounded-full bg-loro-100 text-chocolate-dark border border-white hover:bg-loro-200 transition-colors" 
                  aria-label="WhatsApp"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-3.5 w-3.5" 
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
              </TooltipTrigger>
              <TooltipContent>
                <p>WhatsApp</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}
        
        {email && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={handleEmailClick} 
                className="h-7 w-7 flex items-center justify-center rounded-full bg-loro-100 text-chocolate-dark border border-white hover:bg-loro-200 transition-colors" 
                aria-label="Email"
              >
                <Mail className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Email</p>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
};

export default LeadContactActions;
