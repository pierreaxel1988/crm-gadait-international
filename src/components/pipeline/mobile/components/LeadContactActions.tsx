
import React from 'react';
import { PhoneIcon, MailIcon } from 'lucide-react';
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
  return <div className="flex items-center gap-1.5">
      <TooltipProvider>
        {phone && <>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={handlePhoneCall} className="h-7 w-7 flex items-center justify-center rounded-full bg-loro-sand/20 border border-white transition-transform hover:scale-110 duration-200" aria-label="Appeler">
                  <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium rounded-full">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Appeler</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={handleWhatsAppClick} className="h-7 w-7 flex items-center justify-center rounded-full bg-loro-sand/20 border border-white transition-transform hover:scale-110 duration-200" aria-label="WhatsApp">
                  <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium rounded-full">
                    <img alt="WhatsApp" src="/lovable-uploads/0098d7ef-b8b2-4340-bc84-0521a2eb5245.png" className="h-4 w-4" />
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>WhatsApp</p>
              </TooltipContent>
            </Tooltip>
          </>}
        
        {email && <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={handleEmailClick} className="h-7 w-7 flex items-center justify-center rounded-full bg-loro-sand/20 border border-white transition-transform hover:scale-110 duration-200" aria-label="Email">
                <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium rounded-full">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Email</p>
            </TooltipContent>
          </Tooltip>}
      </TooltipProvider>
    </div>;
};

export default LeadContactActions;
