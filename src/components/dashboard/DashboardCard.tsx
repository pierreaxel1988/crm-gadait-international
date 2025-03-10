
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

const DashboardCard = ({
  title,
  subtitle,
  icon,
  className,
  children,
}: DashboardCardProps) => {
  return (
    <div className={cn('luxury-card p-6 lg:p-8 scale-in', className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="h-[calc(100%-4.5rem)]">{children}</div>
    </div>
  );
};

export default DashboardCard;
