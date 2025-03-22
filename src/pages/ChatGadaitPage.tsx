
import React from 'react';
import { MessageSquare } from 'lucide-react';
import ChatGadait from '@/components/chat/ChatGadait';

const ChatGadaitPage = () => {
  return <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-loro-sand/30">
          <h1 className="text-2xl md:text-3xl font-futura text-loro-navy flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Chat Gadait
          </h1>
          <p className="text-chocolate-dark font-futuraLight">Assistant IA pour la gestion des leads et des propriétés</p>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ChatGadait isOpen={true} onClose={() => {}} />
        </div>
      </div>
    </div>;
};

export default ChatGadaitPage;
