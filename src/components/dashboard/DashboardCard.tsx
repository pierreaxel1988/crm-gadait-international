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
  return;
};
export default DashboardCard;