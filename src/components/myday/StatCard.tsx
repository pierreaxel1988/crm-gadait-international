import React from 'react';
import { Card } from '@/components/ui/card';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  count: number;
}

const StatCard = ({ icon, label, count }: StatCardProps) => (
  <Card className="p-3">
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <p className="text-2xl font-semibold text-foreground">{count}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  </Card>
);

export default StatCard;
