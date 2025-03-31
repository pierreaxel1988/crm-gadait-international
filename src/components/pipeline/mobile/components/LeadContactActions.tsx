
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
                      <path d="M17.472 10.382a4.527 4.527 0 0 0-3.852-3.853c-1.097-.248-2.215-.124-3.215.35-1 .473-1.801 1.274-2.275 2.275a4.527 4.527 0 0 0 .349 4.37l-.436 1.458A9 9 0 0 1 3 21l1.089-.326a9 9 0 1 1 4.39-13.356c2.023-1.342 4.729-1.252 6.651.671 1.923 1.923 2.013 4.629.671 6.651a9 9 0 1 1-13.356 4.39L2.12 20.118A9 9 0 0 1 17.472 10.382z" />
                      <path d="M14.5 14.5c-1 1-2.5 1-3.5 0s-1-2.5 0-3.5 2.5-1 3.5 0 1 2.5 0 3.5z" />
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
