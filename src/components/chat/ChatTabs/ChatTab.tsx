
import React, { useRef } from 'react';
import { MessageSquare, Send, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatTabProps {
  messages: Message[];
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  handleSendMessage: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatTab: React.FC<ChatTabProps> = ({
  messages,
  input,
  setInput,
  isLoading,
  handleSendMessage,
  messagesEndRef
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden">
      <div className="flex-1 overflow-y-auto mb-4 px-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-4 max-w-[85%] ${
              msg.role === 'user' ? 'ml-auto' : 'mr-auto'
            }`}
          >
            <div
              className={`p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-loro-hazel text-white'
                  : 'bg-loro-pearl text-loro-navy'
              }`}
            >
              {msg.content}
            </div>
            <div
              className={`text-xs text-gray-500 mt-1 ${
                msg.role === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              {msg.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="relative border border-loro-sand rounded-md overflow-hidden">
        <Textarea
          className="resize-none pr-12 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[60px]"
          placeholder="Posez votre question..."
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <Button
          size="icon"
          className={`absolute right-2 bottom-2 rounded-full h-8 w-8 ${input.trim() ? 'bg-loro-hazel hover:bg-loro-hazel/90' : 'bg-loro-sand/50'}`}
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? 
            <Loader className="h-4 w-4 animate-spin" /> : 
            <Send className="h-4 w-4" />
          }
        </Button>
      </div>
    </div>
  );
};

export default ChatTab;
