
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversionRateCardProps {
  title: string;
  value: string | number;
  change: number;
  period: string;
  inverse?: boolean;
  isLoading?: boolean;
}

const ConversionRateCard = ({ 
  title, 
  value, 
  change, 
  period,
  inverse = false,
  isLoading = false
}: ConversionRateCardProps) => {
  const isPositive = change > 0;
  const showPositive = inverse ? !isPositive : isPositive;
  
  return (
    <Card className="overflow-hidden border-none shadow-luxury transition-all duration-300 hover:shadow-luxury-hover">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-1">
        <CardContent className="pt-6 pb-6 bg-white">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
            <span className="text-2xl font-semibold mt-1">{isLoading ? '...' : value}</span>
            
            <div className="flex items-center mt-3">
              <span
                className={cn(
                  "inline-flex items-center text-xs font-medium rounded px-1.5 py-0.5",
                  showPositive && 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
                  !showPositive && 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                )}
              >
                {isPositive ? (
                  <ArrowUp className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDown className="mr-1 h-3 w-3" />
                )}
                {Math.abs(change)}%
              </span>
              <span className="ml-1.5 text-xs text-muted-foreground">{period}</span>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default ConversionRateCard;
