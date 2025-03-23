
import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'secondary' | 'success' | 'loropiana' | 'chocolate';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isLoading?: boolean;
  fontStyle?: 'roboto' | 'opensans' | 'optima' | 'times' | 'timesItalic';
}

const CustomButton = ({
  variant = 'default',
  size = 'md',
  className,
  isLoading,
  fontStyle = 'roboto',
  children,
  ...props
}: CustomButtonProps) => {
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'outline':
        return 'border border-gadait-primary text-gadait-primary hover:bg-gadait-primary/10';
      case 'ghost':
        return 'text-gadait-primary hover:bg-gadait-primary/10';
      case 'link':
        return 'text-gadait-primary hover:underline';
      case 'secondary':
        return 'bg-gadait-secondary text-white hover:bg-gadait-secondary/90';
      case 'success':
        return 'bg-gadait-success text-white hover:bg-gadait-success/90';
      case 'loropiana':
        return 'bg-loro-white text-loro-navy border border-loro-pearl hover:bg-loro-pearl dark:bg-loro-navy dark:text-loro-white dark:border-loro-navy/50 dark:hover:bg-loro-navy/80';
      case 'chocolate':
        return 'bg-chocolate-dark text-white hover:bg-chocolate-light dark:bg-chocolate-dark dark:text-white dark:hover:bg-chocolate-light';
      default:
        return 'bg-gadait-primary text-white hover:bg-gadait-primary/90 dark:bg-gadait-primary dark:text-white dark:hover:bg-gadait-primary/90';
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

  const getFontClasses = (fontStyle: string) => {
    switch (fontStyle) {
      case 'opensans':
        return 'font-opensans';
      case 'times':
        return 'font-times';
      case 'timesItalic':
        return 'font-timesItalic';
      case 'optima':
        return 'font-optima';
      default:
        return 'font-roboto';
    }
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-gadait font-medium transition-colors duration-300 focus:outline-none focus:ring-1 focus:ring-gadait-primary disabled:opacity-50 disabled:pointer-events-none shadow-sm hover:shadow-gadait-hover',
        getVariantClasses(variant),
        getSizeClasses(size),
        getFontClasses(fontStyle),
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
