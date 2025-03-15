
import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import ChatGadait from '@/components/chat/ChatGadait';

const ChatGadaitPage = () => {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-loro-navy flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          Chat Gadait
        </h1>
        <p className="text-loro-hazel">Assistant IA pour la gestion des leads et des propriétés</p>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="luxury-card p-0 overflow-hidden h-[80vh]">
          <ChatGadait isOpen={true} onClose={() => {}} />
        </div>
      </div>
    </div>
  );
};

export default ChatGadaitPage;
