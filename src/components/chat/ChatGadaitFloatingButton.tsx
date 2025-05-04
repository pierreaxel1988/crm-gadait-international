
import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatGadait from '@/components/chat/ChatGadait';
import { LeadDetailed } from '@/types/lead';

interface ChatGadaitFloatingButtonProps {
  leadData?: LeadDetailed;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const ChatGadaitFloatingButton: React.FC<ChatGadaitFloatingButtonProps> = ({
  leadData,
  position = 'bottom-right'
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
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
            size="icon" 
            className="rounded-full h-14 w-14 shadow-lg text-white transition-all duration-300 hover:scale-110 bg-loro-terracotta flex items-center justify-center"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </div>
      )}
      
      {/* Chat Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] overflow-hidden flex flex-col">
            <div className="border-b border-loro-sand/30 p-4 flex justify-between items-center">
              <h2 className="text-lg font-medium flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-loro-hazel" />
                {leadData ? `Chat Gadait - ${leadData.name}` : 'Chat Gadait'}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setIsChatOpen(false)} className="hover:bg-loro-pearl/30">
                <X size={18} />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatGadait isOpen={true} onClose={() => setIsChatOpen(false)} leadData={leadData} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatGadaitFloatingButton;
