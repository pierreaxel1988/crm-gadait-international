
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
  isLoading = false
}: DashboardCardProps) => {
  return (
    <Card className={cn('overflow-hidden border-none shadow-sm', className)}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between border-b p-4 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center space-x-3">
            {icon && <div className="text-gray-500">{icon}</div>}
            <div>
              <h3 className="font-medium text-gray-800">{title}</h3>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          
          {action && <div>{action}</div>}
        </div>
        
        <div className="p-4 flex-1">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-[125px] w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </Card>
  );
};

export default DashboardCard;
