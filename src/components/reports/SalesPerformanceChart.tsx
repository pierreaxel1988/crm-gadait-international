
import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useIsMobile } from '@/hooks/use-mobile';

interface SalesPerformanceChartProps {
  data: {
    name: string;
    total: number;
  }[];
  isConversionFunnel?: boolean;
}

const SalesPerformanceChart = ({ data, isConversionFunnel = false }: SalesPerformanceChartProps) => {
  const isMobile = useIsMobile();
  
  // Enhanced colors for better visibility, especially on mobile
  const COLORS = isConversionFunnel 
    ? ['#1A5276', '#2471A3', '#2E86C1', '#3498DB', '#5DADE2', '#85C1E9']
    : ['#2C3E50', '#34495E', '#3D5A80', '#446A9E', '#4A7ABB'];
  
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

  // Adjust margins and other properties based on mobile
  const chartMargin = isMobile
    ? { top: 10, right: 10, bottom: isConversionFunnel ? 50 : 30, left: 20 }
    : { top: 20, right: 30, bottom: 30, left: 30 };

  const barSize = isMobile
    ? (isConversionFunnel ? 20 : 40)
    : (isConversionFunnel ? 40 : 60);

  // Optimize bar gap for better mobile display
  const barGap = isMobile
    ? (isConversionFunnel ? "5%" : "10%")
    : (isConversionFunnel ? "10%" : "20%");

  // Dynamic font size
  const fontSize = isMobile ? 10 : 12;
  
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
          margin={chartMargin}
          barCategoryGap={barGap}
          layout={isMobile && isConversionFunnel ? "vertical" : "horizontal"}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(44, 62, 80, 0.1)" />
          <XAxis
            dataKey={isMobile && isConversionFunnel ? "total" : "name"}
            type={isMobile && isConversionFunnel ? "number" : "category"}
            tickLine={false}
            axisLine={false}
            padding={{ left: 20, right: 20 }}
            fontSize={fontSize}
            tick={{ fill: 'rgba(44, 62, 80, 0.8)' }}
            angle={isMobile && !isConversionFunnel ? -45 : 0}
            textAnchor={isMobile && !isConversionFunnel ? "end" : "middle"}
            height={isMobile && !isConversionFunnel ? 60 : 30}
            tickFormatter={isMobile && isConversionFunnel ? formatYAxis : undefined}
          />
          <YAxis
            dataKey={isMobile && isConversionFunnel ? "name" : "total"}
            type={isMobile && isConversionFunnel ? "category" : "number"}
            tickLine={false}
            axisLine={false}
            width={isMobile && isConversionFunnel ? 70 : undefined}
            tickFormatter={isMobile && isConversionFunnel ? undefined : formatYAxis}
            fontSize={fontSize}
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
            dataKey={isMobile && isConversionFunnel ? "total" : "total"}
            radius={[4, 4, 0, 0]}
            maxBarSize={barSize}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                fillOpacity={isConversionFunnel ? 0.9 : 0.8}
              />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default SalesPerformanceChart;
