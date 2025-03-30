
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
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-futuraLight transition-transform hover:scale-105 duration-200",
        bgClassName,
        textClassName,
        className
      )}
      style={{
        ...getBgStyle(),
        ...getTextStyle()
      }}
    >
      {label}
    </span>
  );
};

export default LeadTag;
