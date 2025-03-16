
import React from 'react';
import { MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  onClose: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose }) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-loro-sand/30 shadow-sm">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-loro-hazel" />
        <h2 className="font-timesNowSemi text-xl text-loro-navy">Chat Gadait</h2>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onClose}
        className="hover:bg-loro-pearl rounded-full h-8 w-8 transition-colors duration-200"
      >
        <X className="h-5 w-5 text-loro-navy" />
      </Button>
    </div>
  );
};

export default ChatHeader;
