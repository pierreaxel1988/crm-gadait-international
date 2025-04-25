
import React from 'react';
import { cn } from '@/lib/utils';

interface FilterGroupProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const FilterGroup = ({ title, children, className }: FilterGroupProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      {title && (
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      )}
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
};

export default FilterGroup;
