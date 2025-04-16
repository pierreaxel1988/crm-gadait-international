
import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatGadait from '@/components/chat/ChatGadait';
import { LeadDetailed } from '@/types/lead';

interface ChatGadaitButtonProps {
  leadData?: LeadDetailed;
  className?: string;
  variant?: 'ghost' | 'outline' | 'chocolate' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
}

const ChatGadaitButton: React.FC<ChatGadaitButtonProps> = ({ 
  leadData,
  className,
  variant = 'ghost',
  size = 'icon',
  showText = false,
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <Button 
        variant={variant} 
        size={size} 
        onClick={() => setIsChatOpen(true)}
        className={`text-loro-navy hover:text-loro-hazel transition-colors duration-200 font-futura ${className}`}
        title="Chat Gadait"
      >
        <MessageSquare size={20} className="mr-1" />
        {showText && <span>Chat Gadait</span>}
      </Button>
      
      <ChatGadait 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        leadData={leadData}
      />
    </>
  );
};

export default ChatGadaitButton;
