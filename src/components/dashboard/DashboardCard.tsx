
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

const DashboardCard = ({
  title,
  subtitle,
  icon,
  action,
  className,
  children,
}: DashboardCardProps) => {
  return (
    <Card className={cn('p-6 lg:p-8 shadow-luxury border-0 flex flex-col h-full', className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-futura text-gray-800">{title}</h3>
          {subtitle && <p className="text-sm font-futura text-muted-foreground mt-1.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          {action && <div className="ml-auto">{action}</div>}
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col h-full">{children}</div>
    </Card>
  );
};

export default DashboardCard;
