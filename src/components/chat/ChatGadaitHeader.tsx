
import React from 'react';
import { MessageSquare } from 'lucide-react';

interface ChatGadaitHeaderProps {
  title: string;
  subtitle: string;
}

const ChatGadaitHeader: React.FC<ChatGadaitHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="mb-4">
      <h1 className="text-2xl md:text-3xl font-timesNowSemi text-loro-navy flex items-center gap-2">
        <MessageSquare className="h-6 w-6" />
        {title}
      </h1>
      <p className="text-zinc-800">{subtitle}</p>
    </div>
  );
};

export default ChatGadaitHeader;
