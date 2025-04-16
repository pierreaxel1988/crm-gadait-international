
import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatGadait from '@/components/chat/ChatGadait';

const ChatGadaitButton: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setIsChatOpen(true)}
        className="text-loro-navy hover:text-loro-hazel transition-colors duration-200 font-futura"
        title="Chat Gadait"
      >
        <MessageSquare size={20} />
      </Button>
      
      <ChatGadait 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </>
  );
};

export default ChatGadaitButton;
