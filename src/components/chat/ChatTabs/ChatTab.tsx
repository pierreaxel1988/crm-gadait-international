
import React, { useEffect, useState, useRef } from 'react';
import { MessageSquare, ArrowDown } from 'lucide-react';
import EnhancedInput from '../EnhancedInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

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
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Check if we should show the scroll button
  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Show button when user has scrolled up (not at bottom)
      const isNotAtBottom = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isNotAtBottom);
    }
  };
  
  // Function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Automatically scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden">
      <ScrollArea className="flex-1 mb-4 pr-4" ref={scrollContainerRef} onScroll={checkScrollPosition}>
        <div className="space-y-4 px-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[85%] ${
                msg.role === 'user' ? 'ml-auto' : 'mr-auto'
              }`}
            >
              <div
                className={`p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-loro-hazel text-white'
                    : 'bg-loro-pearl/50 text-loro-navy'
                } shadow-sm`}
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
      </ScrollArea>
      
      {/* Scroll down button */}
      {showScrollButton && (
        <Button
          className="absolute bottom-24 right-8 h-10 w-10 rounded-full bg-loro-hazel text-white shadow-md hover:bg-loro-hazel/90 z-10 transition-all duration-300"
          onClick={scrollToBottom}
          size="icon"
        >
          <ArrowDown className="h-5 w-5" />
        </Button>
      )}
      
      <EnhancedInput
        input={input}
        setInput={setInput}
        placeholder="Ask anything..."
        isLoading={isLoading}
        handleSend={handleSendMessage}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default ChatTab;
