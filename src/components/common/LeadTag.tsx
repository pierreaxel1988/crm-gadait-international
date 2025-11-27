
import React from 'react';
import { cn } from "@/lib/utils";

export interface LeadTagProps {
  label: string;
  bgColor?: string;
  textColor?: string;
  className?: string;
}

/**
 * LeadTag - A reusable tag component for displaying lead statuses and categories
 * 
 * @param {string} label - The text to display within the tag
 * @param {string} bgColor - Tailwind class or hex color for background
 * @param {string} textColor - Tailwind class or hex color for text
 * @param {string} className - Additional class names to apply to the tag
 */
const LeadTag = ({ 
  label, 
  bgColor = 'bg-loro-50', 
  textColor = 'text-loro-700', 
  className 
}: LeadTagProps) => {
  // Format numeric values in the label with proper thousand separators
  const formattedLabel = React.useMemo(() => {
    // Ensure label is a valid string
    if (!label || typeof label !== 'string') {
      return String(label || '');
    }
    
    // Check if label is a budget value by detecting currency symbols or K/M suffix
    const budgetRegex = /^(\D*)(\d+(?:[,.]\d+)?)(\s*[KkMm€$£]*|\s*EUR|\s*USD|\s*GBP)?$/;
    const match = label.match(budgetRegex);
    
    if (match) {
      const prefix = match[1] || '';
      let value = match[2] || '';
      const suffix = match[3] || '';
      
      // If we have a numeric value, format it with thousand separators
      if (value) {
        // Replace commas with dots for standard parsing
        const numericValue = parseFloat(value.replace(',', '.'));
        
        if (!isNaN(numericValue)) {
          // Format the number with thousand separators without truncating digits
          const formattedValue = new Intl.NumberFormat('fr-FR').format(numericValue);
          
          // If the value is in K or M format, convert it
          if (suffix.toUpperCase().includes('K')) {
            const fullValue = numericValue * 1000;
            return prefix + new Intl.NumberFormat('fr-FR').format(fullValue) + (suffix.replace(/[KkMm]/g, '') || '');
          } else if (suffix.toUpperCase().includes('M')) {
            const fullValue = numericValue * 1000000;
            return prefix + new Intl.NumberFormat('fr-FR').format(fullValue) + (suffix.replace(/[KkMm]/g, '') || '');
          } else {
            // Normal formatting with thousand separators
            return prefix + formattedValue + suffix;
          }
        }
      }
    }
    
    // Return original label if not a budget value
    return label;
  }, [label]);
  
  // Check if the colors are hex values or Tailwind classes
  const getBgStyle = () => {
    if (bgColor.startsWith('#') || bgColor.startsWith('rgb')) {
      return { backgroundColor: bgColor };
    }
    return {};
  };

  const getTextStyle = () => {
    if (textColor.startsWith('#') || textColor.startsWith('rgb')) {
      return { color: textColor };
    }
    return {};
  };

  // Determine the className based on whether bgColor is a Tailwind class or a hex value
  const bgClassName = bgColor.startsWith('bg-') ? bgColor : '';
  const textClassName = textColor.startsWith('text-') ? textColor : '';

  return (
    <span 
      className={cn(
        "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-futuraLight transition-transform hover:scale-105 duration-200 border border-opacity-30",
        bgClassName,
        textClassName,
        className
      )}
      style={{
        ...getBgStyle(),
        ...getTextStyle(),
        borderColor: 'currentColor' // Makes the border color match the text color but more subtle
      }}
    >
      {formattedLabel}
    </span>
  );
};

export default LeadTag;
