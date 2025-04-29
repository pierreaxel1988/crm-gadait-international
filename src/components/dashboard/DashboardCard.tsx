
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
  isLoading?: boolean;
}

const DashboardCard = ({
  title,
  subtitle,
  icon,
  action,
  className,
  children,
  isLoading = false,
}: DashboardCardProps) => {
  return (
    <Card className={cn('p-6 lg:p-8 shadow-luxury border-0 flex flex-col h-full', className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-futura font-semibold text-gray-800">{title}</h3>
          {subtitle && <p className="text-sm font-futura text-muted-foreground mt-1.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          {action && <div className="ml-auto">{action}</div>}
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col h-full">
        {isLoading ? (
          <div className="flex-1 flex flex-col space-y-4 p-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
          </div>
        ) : (
          children
        )}
      </div>
    </Card>
  );
};

export default DashboardCard;
