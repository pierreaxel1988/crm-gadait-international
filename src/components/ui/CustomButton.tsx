
import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'secondary' | 'loropiana';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isLoading?: boolean;
}

const CustomButton = ({
  variant = 'default',
  size = 'md',
  className,
  isLoading,
  children,
  ...props
}: CustomButtonProps) => {
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'outline':
        return 'border border-primary text-primary hover:bg-primary/10';
      case 'ghost':
        return 'text-primary hover:bg-primary/10';
      case 'link':
        return 'text-primary hover:underline';
      case 'secondary':
        return 'bg-secondary text-secondary-foreground hover:bg-secondary/90';
      case 'loropiana':
        return 'bg-[#F1F1F1] text-[#222222] border border-[#E0E0E0] hover:bg-[#E8E8E8] dark:bg-[#2A2A2A] dark:text-[#F5F5F5] dark:border-[#3A3A3A] dark:hover:bg-[#333333]';
      default:
        return 'bg-[#222222] text-white hover:bg-[#333333] dark:bg-[#F1F1F1] dark:text-[#222222] dark:hover:bg-[#E0E0E0]';
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'h-8 px-3 text-xs';
      case 'lg':
        return 'h-12 px-6 text-base';
      default:
        return 'h-10 px-4 text-sm';
    }
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-none font-medium transition-colors duration-300 focus:outline-none focus:ring-1 focus:ring-[#222222] dark:focus:ring-[#F1F1F1] disabled:opacity-50 disabled:pointer-events-none',
        getVariantClasses(variant),
        getSizeClasses(size),
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default CustomButton;
