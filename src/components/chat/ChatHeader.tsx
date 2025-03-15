
import React from 'react';
import { MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  onClose: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-loro-sand">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-6 w-6 text-loro-hazel" />
        <h2 className="font-timesNowSemi text-xl text-loro-navy">Chat Gadait</h2>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onClose}
        className="hover:bg-loro-pearl rounded-full h-8 w-8"
      >
        <X className="h-5 w-5 text-loro-navy" />
      </Button>
    </div>
  );
};

export default ChatHeader;
