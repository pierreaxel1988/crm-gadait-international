
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
                  className="h-7 w-7 flex items-center justify-center rounded-full bg-loro-sand/20 border border-white transition-transform hover:scale-110 duration-200" 
                  aria-label="Appeler"
                >
                  <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium rounded-full">
                    <Phone className="h-3.5 w-3.5" />
                  </div>
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
                  className="h-7 w-7 flex items-center justify-center rounded-full bg-loro-sand/20 border border-white transition-transform hover:scale-110 duration-200" 
                  aria-label="WhatsApp"
                >
                  <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium rounded-full">
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
                      <path d="M9.1 11.2a.5.5 0 0 1 .8.6c0 1.48 1.1 2.68 2.48 2.87.4.06.74-.04 1.05-.24.35-.23.6-.6.75-1 .08-.23.12-.47.06-.7-.14-.53-.7-.7-1.12-.94-.34-.18-.76-.45-.77-.86 0-.43.35-.72.65-.97.24-.2.42-.41.42-.8 0-.52-.53-1-1.07-1.1-.83-.17-1.7.28-2.14.97-.44.67-.56 1.54-.11 2.17" />
                    </svg>
                  </div>
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
                className="h-7 w-7 flex items-center justify-center rounded-full bg-loro-sand/20 border border-white transition-transform hover:scale-110 duration-200" 
                aria-label="Email"
              >
                <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium rounded-full">
                  <Mail className="h-3.5 w-3.5" />
                </div>
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
