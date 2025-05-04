
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatTabProps {
  messages: any[];
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  handleSendMessage: (message?: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  suggestedPrompts?: string[];
}

const ChatTab: React.FC<ChatTabProps> = ({
  messages,
  input,
  setInput,
  isLoading,
  handleSendMessage,
  messagesEndRef,
  suggestedPrompts
}) => {
  const [showSuggestions, setShowSuggestions] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        handleSendMessage();
      }
    }
  };

  const handleSuggestedPromptClick = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => {
      handleSendMessage(prompt);
      setShowSuggestions(false);
    }, 100);
  };

  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  useEffect(() => {
    // Show suggestions when:
    // 1. There are no messages yet
    // 2. Or the last message is from the system/assistant
    setShowSuggestions(
      messages.length === 0 || 
      (messages.length > 0 && messages[messages.length - 1].role !== 'user')
    );
  }, [messages]);

  return (
    <div className="flex flex-col h-full relative">
      <ScrollArea className="flex-grow p-4">
        <div className="space-y-4">
          {messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col max-w-[80%] rounded-lg p-3",
                  message.role === 'user' 
                    ? "bg-loro-hazel/10 ml-auto text-loro-navy" 
                    : "bg-loro-pearl mr-auto text-loro-navy"
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-50 ml-auto mt-1">
                  {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center p-6 text-loro-navy/70">
              <p className="mb-4">Comment puis-je vous aider aujourd'hui?</p>
              {suggestedPrompts && suggestedPrompts.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium text-sm">Suggestions:</p>
                  {suggestedPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="bg-loro-sand/20 hover:bg-loro-sand/40 m-1 text-left justify-start h-auto py-2 px-3 text-sm"
                      onClick={() => handleSuggestedPromptClick(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Show suggested prompts after messages if available */}
          {messages.length > 0 && showSuggestions && suggestedPrompts && suggestedPrompts.length > 0 && (
            <div className="pt-2 pb-4">
              <p className="text-sm font-medium text-loro-navy/70 mb-2">Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="bg-loro-sand/20 hover:bg-loro-sand/40 text-left justify-start h-auto py-2 px-3 text-xs"
                    onClick={() => handleSuggestedPromptClick(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="border-t border-loro-sand/30 p-3 bg-white sticky bottom-0">
        <div className="flex items-end gap-2 rounded-md border border-loro-sand/50 bg-white">
          <textarea
            ref={inputRef}
            className="flex-1 px-3 py-2 bg-transparent outline-none resize-none min-h-[48px] max-h-[150px]"
            placeholder="Écrivez votre message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <Button 
            type="submit" 
            variant="ghost" 
            size="icon"
            disabled={isLoading || !input.trim()} 
            onClick={() => handleSendMessage()}
            className="mb-1 mr-1 h-8 w-8 hover:bg-loro-sand/20"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatTab;
