
import React from 'react';
import { cn } from '@/lib/utils';

interface LouisVuittonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'filled' | 'outlined';
  className?: string;
}

const LouisVuittonButton = ({
  variant = 'default',
  className,
  children,
  ...props
}: LouisVuittonButtonProps) => {
  return (
    <button
      className={cn(
        'font-louisvuitton uppercase tracking-widest px-6 py-2 text-sm transition-colors duration-300',
        variant === 'default' && 'border border-black hover:bg-black hover:text-white',
        variant === 'filled' && 'bg-black text-white hover:bg-black/90',
        variant === 'outlined' && 'border border-black bg-transparent text-black hover:bg-black/5',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default LouisVuittonButton;
