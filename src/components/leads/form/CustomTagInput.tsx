
import React, { useState, useRef, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CustomTagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  predefinedOptions?: string[];
}

const CustomTagInput: React.FC<CustomTagInputProps> = ({
  tags,
  onChange,
  placeholder = 'Ajouter...',
  className,
  predefinedOptions = []
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Filter predefined options that haven't been selected yet
  const availableOptions = predefinedOptions.filter(
    option => !tags.includes(option)
  );

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag];
      onChange(newTags);
    }
    setInputValue('');
    setIsDropdownOpen(false);
    inputRef.current?.focus();
  };

  const removeTag = (indexToRemove: number) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    onChange(newTags);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  // Filter options based on input value
  const filteredOptions = availableOptions.filter(option => 
    option.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <div 
            key={index} 
            className="flex items-center gap-1 py-1 px-2 rounded-full text-xs bg-primary text-white"
          >
            {tag}
            <button 
              type="button" 
              onClick={() => removeTag(index)}
              className="h-3 w-3 rounded-full hover:bg-red-500/20 flex items-center justify-center"
            >
              <X className="h-2 w-2" />
            </button>
          </div>
        ))}
      </div>
      
      <div className="relative">
        <div className="flex">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsDropdownOpen(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsDropdownOpen(true)}
            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 100)}
            placeholder={placeholder}
            className="flex-1"
          />
          <Button 
            type="button"
            variant="outline"
            className="ml-2"
            onClick={() => inputValue && addTag(inputValue)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {isDropdownOpen && filteredOptions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredOptions.map((option, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                onClick={() => addTag(option)}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomTagInput;
