
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Euro, Landmark, BarChart3 } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';

interface FinancialMetricCardProps {
  title: string;
  value: string | number;
  change: number;
  period: string;
  icon: React.ReactNode;
  isLoading?: boolean;
}

const FinancialMetricCard = ({ 
  title, 
  value, 
  change, 
  period,
  icon,
  isLoading = false
}: FinancialMetricCardProps) => {
  return (
    <Card className="overflow-hidden border-none shadow-luxury transition-all duration-300 hover:shadow-luxury-hover">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-1">
        <CardContent className="pt-6 pb-6 bg-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider font-futura">{title}</p>
              <h3 className="text-3xl font-bold mt-1 font-futura text-gray-900">
                {isLoading ? <Skeleton className="h-8 w-24" /> : value}
              </h3>
              <div className="flex items-center mt-2">
                <span className={cn(
                  "inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded",
                  change > 0 ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"
                )}>
                  {change > 0 ? '+' : ''}{change}%
                </span>
                <span className="ml-1.5 text-xs text-gray-500">depuis le dernier {period}</span>
              </div>
            </div>
            <div className={cn(
              "p-2.5 rounded-full",
              "bg-blue-100"
            )}>
              {icon}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default FinancialMetricCard;
