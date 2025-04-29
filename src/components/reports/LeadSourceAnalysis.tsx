
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

interface LeadSourceData {
  name: string;
  count: number;
  cost: number;
  conversion: number;
  roi: number;
}

interface LeadSourceAnalysisProps {
  data: LeadSourceData[];
  isLoading: boolean;
  metric: 'count' | 'cost' | 'conversion' | 'roi';
}

const LeadSourceAnalysis = ({ data, isLoading, metric }: LeadSourceAnalysisProps) => {
  if (isLoading) {
    return <div className="w-full h-[400px] flex items-center justify-center">
      <Skeleton className="w-full h-[350px]" />
    </div>;
  }
  
  const colors = {
    count: "#8884d8",
    cost: "#82ca9d",
    conversion: "#ffc658",
    roi: "#ff8042"
  };
  
  const getMetricLabel = () => {
    switch(metric) {
      case 'count': return 'Nombre de leads';
      case 'cost': return 'Coût d\'acquisition (€)';
      case 'conversion': return 'Taux de conversion (%)';
      case 'roi': return 'ROI (%)';
      default: return '';
    }
  };
  
  // Calculate average for reference line
  const average = data.reduce((sum, item) => sum + item[metric], 0) / data.length;
  
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
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
            formatter={(value) => [
              metric === 'cost' ? `€${value}` : 
              (metric === 'conversion' || metric === 'roi') ? `${value}%` : value,
              getMetricLabel()
            ]}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              border: "1px solid #f1f1f1"
            }}
          />
          <Legend />
          <ReferenceLine y={average} stroke="#666" strokeDasharray="3 3" label={{
            value: 'Moyenne',
            position: 'insideBottomRight',
            fill: '#666',
            fontSize: 12
          }} />
          <Bar dataKey={metric} fill={colors[metric]} name={getMetricLabel()} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LeadSourceAnalysis;
