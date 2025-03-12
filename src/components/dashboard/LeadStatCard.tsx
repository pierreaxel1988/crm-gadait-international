
import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeadStatCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void; // Added onClick property
}

const LeadStatCard = ({ title, value, change, icon, className, onClick }: LeadStatCardProps) => {
  const isPositive = typeof change === 'number' && change > 0;
  const isNegative = typeof change === 'number' && change < 0;

  return (
    <div 
      className={cn('luxury-card flex flex-col p-6 scale-in', 
        onClick ? 'cursor-pointer hover:ring-1 hover:ring-primary/20' : '',
        className
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
      <div className="mt-1">
        <span className="text-2xl font-serif font-semibold">{value}</span>
        {typeof change === 'number' && (
          <div className="flex items-center mt-2">
            <span
              className={cn(
                'inline-flex items-center text-xs font-medium rounded px-1.5 py-0.5',
                isPositive && 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
                isNegative && 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
                !isPositive && !isNegative && 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30'
              )}
            >
              {isPositive ? (
                <ArrowUp className="mr-1 h-3 w-3" />
              ) : isNegative ? (
                <ArrowDown className="mr-1 h-3 w-3" />
              ) : null}
              {Math.abs(change)}%
            </span>
            <span className="ml-1.5 text-xs text-muted-foreground">from last month</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadStatCard;
