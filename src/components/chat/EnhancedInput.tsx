
import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface EnhancedInputProps {
  input: string;
  setInput: (input: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  handleSend: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  className?: string;
  suggestedPrompts?: string[];
}

const EnhancedInput: React.FC<EnhancedInputProps> = ({
  input,
  setInput,
  placeholder = 'Type your message...',
  isLoading = false,
  handleSend,
  onKeyDown,
  className,
  suggestedPrompts = []
}) => {
  const [rows, setRows] = useState(1);
  const [showPrompts, setShowPrompts] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const promptsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Update rows based on content
    if (textareaRef.current) {
      const textareaLineHeight = 24; // approximate line height
      const minRows = 1;
      const maxRows = 5;
      
      const previousRows = textareaRef.current.rows;
      textareaRef.current.rows = minRows; // Reset rows
      
      const currentRows = Math.min(
        maxRows,
        Math.max(
          minRows,
          Math.ceil(textareaRef.current.scrollHeight / textareaLineHeight)
        )
      );
      
      if (currentRows === previousRows) {
        textareaRef.current.rows = currentRows;
      }
      
      if (currentRows !== rows) {
        setRows(currentRows);
      }
    }
  }, [input]);

  useEffect(() => {
    // Close prompt suggestions when clicked outside
    const handleClickOutside = (event: MouseEvent) => {
      if (promptsRef.current && !promptsRef.current.contains(event.target as Node)) {
        setShowPrompts(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [promptsRef]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSelectPrompt = (prompt: string) => {
    setInput(prompt);
    setShowPrompts(false);
    textareaRef.current?.focus();
  };

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-end border rounded-lg bg-white shadow-sm overflow-hidden">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          rows={rows}
          className="flex-1 py-3 px-4 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
          data-chatgadait-input
        />
        
        <div className="p-2">
          <Button
            type="button"
            size="icon"
            disabled={isLoading || !input.trim()}
            onClick={handleSend}
            className="bg-loro-terracotta hover:bg-loro-terracotta/90 text-white rounded-full h-10 w-10"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <SendHorizontal className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      
      {suggestedPrompts && suggestedPrompts.length > 0 && (
        <div className="absolute bottom-full mb-2 right-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPrompts(!showPrompts)}
            className="flex items-center gap-1 border-loro-pearl bg-white shadow-sm"
          >
            <span className="text-loro-chocolate">Suggestions</span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", showPrompts && "rotate-180")} />
          </Button>
          
          {showPrompts && (
            <div 
              ref={promptsRef}
              className="absolute right-0 bottom-full mb-2 w-[280px] bg-white rounded-lg border border-loro-pearl/50 shadow-md p-2 z-10"
            >
              <div className="text-xs text-muted-foreground mb-2 px-2">Sélectionnez une suggestion</div>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {suggestedPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectPrompt(prompt)}
                    className="w-full text-left p-2 hover:bg-loro-pearl/20 rounded text-loro-chocolate text-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedInput;
