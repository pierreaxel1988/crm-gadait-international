
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tags } from 'lucide-react';
import { LeadTag } from '@/components/common/TagBadge';

export type TagFilterValue = LeadTag | 'no-tags';

interface TagFilterButtonsProps {
  selectedTags: TagFilterValue[];
  setSelectedTags: (tags: TagFilterValue[]) => void;
}

const TagFilterButtons: React.FC<TagFilterButtonsProps> = ({ selectedTags, setSelectedTags }) => {
  const allTags: LeadTag[] = [
    'Vip',
    'Hot',
    'Serious',
    'Cold',
    'No response',
    'No phone',
    'Fake',
    'Imported',
    'Not a fit'
  ];

  const toggleTag = (tag: TagFilterValue) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const clearAllTags = () => {
    setSelectedTags([]);
  };

  // Get background color for each tag (matching TagBadge styles)
  const getTagBgColor = (tag: TagFilterValue): string => {
    switch (tag) {
      case 'Vip':
        return '#D3C5B4'; // loro-300
      case 'Hot':
        return '#EBD5CE';
      case 'Serious':
        return '#E8E2DA'; // loro-200
      case 'Cold':
        return '#F5F4F0'; // loro-50
      case 'No response':
        return '#F0EDE8'; // loro-100
      case 'No phone':
        return '#E8E2D4'; // loro-sand
      case 'Fake':
        return '#F5F5F0'; // loro-pearl
      case 'Imported':
        return '#FAFAF8'; // loro-white
      case 'Not a fit':
        return '#FEE2E2'; // red-100
      case 'no-tags':
        return '#E5E7EB'; // gray-200
      default:
        return '#F0EDE8';
    }
  };

  // Get text color for each tag (matching TagBadge styles)
  const getTagTextColor = (tag: TagFilterValue): string => {
    switch (tag) {
      case 'Vip':
        return '#5C4B3A'; // loro-900
      case 'Hot':
        return '#C76B5A'; // loro-terracotta
      case 'Serious':
        return '#7A6B5A'; // loro-700
      case 'Cold':
        return '#6B5D4D'; // loro-800
      case 'No response':
        return '#7A6B5A'; // loro-700
      case 'No phone':
        return '#8B6F4E'; // loro-hazel
      case 'Fake':
        return '#1A365D'; // loro-navy
      case 'Imported':
        return '#8A7B6A'; // loro-500
      case 'Not a fit':
        return '#B91C1C'; // red-700
      case 'no-tags':
        return '#6B7280'; // gray-500
      default:
        return '#6B5D4D';
    }
  };

  const renderTagButton = (tag: TagFilterValue, label: string) => {
    const isSelected = selectedTags.includes(tag);
    const bgColor = isSelected ? getTagBgColor(tag) : 'transparent';
    const textColor = isSelected ? getTagTextColor(tag) : '#8E9196';
    
    return (
      <Button
        key={tag}
        variant="outline"
        size="sm"
        className={`text-xs font-futura rounded-full px-3 py-1 transition-all duration-200 ${isSelected ? 'ring-1 ring-offset-1 scale-105' : ''}`}
        onClick={() => toggleTag(tag)}
        style={{
          background: isSelected ? bgColor : 'transparent',
          border: isSelected 
            ? `1px solid rgba(211, 197, 180, 0.7)` 
            : '1px solid rgba(211, 197, 180, 0.3)',
          color: textColor,
          fontWeight: isSelected ? 600 : 400,
          fontFamily: 'Futura, Optima, Verdana, Geneva, sans-serif',
          letterSpacing: '0.035em',
          boxShadow: isSelected ? '0 2px 5px rgba(139, 111, 78, 0.1)' : undefined,
          transition: 'all 0.2s ease-out',
          outline: 'none'
        }}
      >
        {label}
      </Button>
    );
  };

  return (
    <div>
      <h4 className="text-xs font-futuraMedium mb-2 flex items-center gap-2 text-loro-navy/90">
        <Tags className="h-4 w-4" /> Tags
      </h4>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedTags.length === 0 ? "default" : "outline"}
          size="sm"
          className={`text-xs font-futura rounded-full px-3 py-1 ${selectedTags.length === 0 ? 'ring-1 ring-loro-sand/40' : 'border-loro-pearl/60'}`}
          onClick={clearAllTags}
          style={{
            background: selectedTags.length === 0 ? '#F5F4F0' : '#fff',
            color: selectedTags.length === 0 ? '#221F26' : '#8E9196',
            fontWeight: 500,
            border: selectedTags.length === 0 ? '1px solid rgba(211, 197, 180, 0.7)' : '1px solid rgba(211, 197, 180, 0.3)',
            boxShadow: selectedTags.length === 0 ? '0 2px 5px rgba(139, 111, 78, 0.1)' : undefined,
            letterSpacing: '0.04em',
          }}
        >
          Tous
        </Button>
        {renderTagButton('no-tags', 'No Tags')}
        {allTags.map(tag => renderTagButton(tag, tag))}
      </div>
    </div>
  );
};

export default TagFilterButtons;
