
import React from 'react';
import { Phone, Mail, MessageSquare } from 'lucide-react';
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
                  className="h-7 w-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" 
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
                  className="h-7 w-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" 
                  aria-label="WhatsApp"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
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
                className="h-7 w-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" 
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
