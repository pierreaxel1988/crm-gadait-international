
import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatGadait from '@/components/chat/ChatGadait';
import { LeadDetailed } from '@/types/lead';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface ChatGadaitFloatingButtonProps {
  leadData?: LeadDetailed;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  initialPrompt?: string;
}

const ChatGadaitFloatingButton: React.FC<ChatGadaitFloatingButtonProps> = ({
  leadData,
  position = 'bottom-right',
  initialPrompt
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const positionClasses = {
    'bottom-right': 'bottom-20 right-4',
    'bottom-left': 'bottom-20 left-4',
    'top-right': 'top-20 right-4',
    'top-left': 'top-20 left-4'
  };
  
  return (
    <>
      {/* Floating Button */}
      {!isChatOpen && (
        <div className={`fixed z-50 ${positionClasses[position]}`}>
          <Button 
            onClick={() => setIsChatOpen(true)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            size="icon" 
            className={cn(
              "rounded-full h-14 w-14 shadow-lg text-white transition-all duration-300 bg-loro-terracotta flex items-center justify-center",
              isHovered ? "scale-110 shadow-xl bg-loro-500" : ""
            )}
            aria-label="Ouvrir Chat Gadait"
          >
            <MessageSquare 
              className={cn(
                "h-6 w-6 transition-transform duration-300",
                isHovered ? "rotate-12" : ""
              )} 
            />
          </Button>
        </div>
      )}
      
      {/* Full screen chat using Sheet component */}
      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetContent side="bottom" className="p-0 sm:p-0 h-[100dvh] w-full max-w-none">
          <div className="h-full flex flex-col">
            <div className="border-b border-loro-sand/30 p-4 flex justify-between items-center bg-white">
              <h2 className="text-lg font-medium flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-loro-hazel" />
                {leadData ? `Chat Gadait - ${leadData.name}` : 'Chat Gadait'}
              </h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsChatOpen(false)} 
                className="hover:bg-loro-pearl/30"
                aria-label="Fermer"
              >
                <X size={18} />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatGadait 
                isOpen={true} 
                onClose={() => setIsChatOpen(false)} 
                leadData={leadData}
                initialPrompt={initialPrompt}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ChatGadaitFloatingButton;
