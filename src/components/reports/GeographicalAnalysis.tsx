
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import DashboardCard from '@/components/dashboard/DashboardCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface GeographicalAnalysisProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  isLoading?: boolean;
}

const GeographicalAnalysis = ({ data, isLoading = false }: GeographicalAnalysisProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3 h-full flex flex-col justify-center items-center">
        <Skeleton className="h-[250px] w-[250px] rounded-full" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    );
  }

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${value} transactions`, 'Volume']}
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #f1f1f1'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GeographicalAnalysis;
