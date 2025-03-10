
import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface SalesPerformanceChartProps {
  data: {
    name: string;
    total: number;
  }[];
  isConversionFunnel?: boolean;
}

const SalesPerformanceChart = ({ data, isConversionFunnel = false }: SalesPerformanceChartProps) => {
  // Colors for the chart - Luxury tones
  const COLORS = ['#2C3E50', '#34495E', '#3D5A80', '#446A9E', '#4A7ABB'];
  
  const formatYAxis = (value: number) => {
    return isConversionFunnel 
      ? value.toString()
      : `€${(value / 1000).toFixed(0)}k`;
  };
  
  const formatTooltip = (value: number) => {
    return isConversionFunnel
      ? value.toString()
      : `€${value.toLocaleString()}`;
  };
  
  return (
    <ChartContainer 
      config={{
        total: {
          label: isConversionFunnel ? "Nombre" : "Ventes",
          color: "#2C3E50"
        }
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart 
          data={data}
          margin={{ top: 20, right: 30, bottom: 30, left: 30 }}
          barCategoryGap={isConversionFunnel ? "10%" : "20%"}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(44, 62, 80, 0.1)" />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            padding={{ left: 20, right: 20 }}
            fontSize={12}
            tick={{ fill: 'rgba(44, 62, 80, 0.8)' }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={formatYAxis}
            fontSize={12}
            tick={{ fill: 'rgba(44, 62, 80, 0.8)' }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <ChartTooltipContent
                    formatter={(value) => formatTooltip(value as number)}
                    active={active}
                    payload={payload}
                    label={label}
                  />
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="total"
            radius={[4, 4, 0, 0]}
            fill={COLORS[0]}
            maxBarSize={isConversionFunnel ? 40 : 60}
            animationDuration={800}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default SalesPerformanceChart;
