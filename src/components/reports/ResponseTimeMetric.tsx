
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatResponseTime } from '@/utils/formatUtils';

interface ResponseTimeMetricProps {
  responseTime: number;
  change?: number;
  period: string;
  isLoading?: boolean;
}

const ResponseTimeMetric: React.FC<ResponseTimeMetricProps> = ({ 
  responseTime, 
  change = 0,
  period,
  isLoading = false
}) => {
  const periodLabel = 
    period === 'week' ? 'cette semaine' : 
    period === 'month' ? 'ce mois' : 
    period === 'quarter' ? 'ce trimestre' : 'cette année';

  if (isLoading) {
    return (
      <Card className="overflow-hidden border-none shadow-luxury transition-all duration-300 hover:shadow-luxury-hover">
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-1">
          <CardContent className="pt-6 pb-6 bg-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider font-futura">
                  Temps de réponse moyen
                </p>
                <Skeleton className="h-8 w-24 mt-1" />
                <Skeleton className="h-4 w-32 mt-2" />
              </div>
              <div className="bg-indigo-100 p-2.5 rounded-full">
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  const formattedTime = formatResponseTime(responseTime);

  return (
    <Card className="overflow-hidden border-none shadow-luxury transition-all duration-300 hover:shadow-luxury-hover">
      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-1">
        <CardContent className="pt-6 pb-6 bg-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider font-futura">
                Temps de réponse moyen
              </p>
              <h3 className="text-3xl font-bold mt-1 font-futura text-gray-900">
                {formattedTime}
              </h3>
              <div className="flex items-center mt-2">
                <span className={`inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded ${
                  // For response time, negative change is good (faster)
                  change < 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
                }`}>
                  {change < 0 ? '' : '+'}{change}%
                </span>
                <span className="ml-1.5 text-xs text-gray-500">
                  depuis {periodLabel}
                </span>
              </div>
            </div>
            <div className="bg-indigo-100 p-2.5 rounded-full">
              <Clock className="h-6 w-6 text-indigo-700" />
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default ResponseTimeMetric;
