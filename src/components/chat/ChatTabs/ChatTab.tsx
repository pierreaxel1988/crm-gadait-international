
import React from 'react';
import { MessageSquare } from 'lucide-react';
import EnhancedInput from '../EnhancedInput';

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
