
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from 'lucide-react';

interface PredictiveDataPoint {
  name: string;
  actual: number;
  predicted: number;
  lowerBound?: number;
  upperBound?: number;
}

interface PredictiveAnalysisProps {
  data: PredictiveDataPoint[];
  title: string;
  isLoading: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
}

const PredictiveAnalysis = ({ 
  data, 
  title, 
  isLoading,
  valuePrefix = '',
  valueSuffix = ''
}: PredictiveAnalysisProps) => {
  if (isLoading) {
    return <div className="w-full h-[400px] flex items-center justify-center">
      <Skeleton className="w-full h-[350px]" />
    </div>;
  }
  
  const formatValue = (value: number) => {
    return `${valuePrefix}${value}${valueSuffix}`;
  };
  
  // Find where actual data ends and prediction begins
  const predictionStartIndex = data.findIndex(item => item.predicted !== undefined && item.actual === undefined);
  
  return (
    <Card className="w-full h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 border-b bg-gradient-to-r from-gray-50 to-gray-100">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-gray-500" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [formatValue(value as number), '']}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                border: "1px solid #f1f1f1"
              }}
            />
            <Legend />
            {predictionStartIndex > 0 && (
              <ReferenceLine 
                x={data[predictionStartIndex].name} 
                stroke="#666" 
                strokeDasharray="3 3" 
                label={{ value: 'Prévisions', position: 'top', fill: '#666' }} 
              />
            )}
            
            <Area 
              type="monotone" 
              dataKey="lowerBound" 
              stroke="none" 
              fill="#8884d8" 
              fillOpacity={0.2} 
              name="Min (prévision)"
              activeDot={false}
            />
            <Area 
              type="monotone" 
              dataKey="upperBound" 
              stroke="none" 
              fill="#8884d8" 
              fillOpacity={0.2} 
              name="Max (prévision)"
              activeDot={false}
            />
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#1e88e5" 
              strokeWidth={2} 
              dot={{ r: 4 }}
              name="Données réelles" 
            />
            <Line 
              type="monotone" 
              dataKey="predicted" 
              stroke="#8884d8" 
              strokeWidth={2} 
              strokeDasharray="5 5"
              name="Prévisions"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PredictiveAnalysis;
