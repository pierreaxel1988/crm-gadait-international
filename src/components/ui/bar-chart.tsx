
import * as React from 'react';
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
import { ChartContainer, ChartTooltipContent } from './chart';

interface BarChartProps {
  data: {
    name: string;
    total: number;
  }[];
}

export function BarChart({ data }: BarChartProps) {
  // Define color gradients for bars - Updated to navy blue tones
  const COLORS = ['#2C3E50', '#34495E', '#3D5A80', '#446A9E', '#4A7ABB'];
  
  // Check for data in localStorage
  const [chartData, setChartData] = React.useState(data);
  
  React.useEffect(() => {
    const savedData = localStorage.getItem('adminChartData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          setChartData(parsedData);
        }
      } catch (e) {
        console.error('Error parsing chart data from localStorage:', e);
      }
    }
  }, [data]);
  
  // Calculate a better Y-axis domain
  const maxValue = Math.max(...chartData.map(item => item.total));
  const minValue = Math.min(...chartData.map(item => item.total));
  const buffer = (maxValue - minValue) * 0.1; // 10% buffer
  
  return (
    <ChartContainer 
      config={{
        total: {
          label: "Total",
          color: "#2C3E50"
        }
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart 
          data={chartData} 
          margin={{ top: 30, right: 30, bottom: 30, left: 30 }}
          barCategoryGap="20%"
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
            tickFormatter={(value) => `€${value}`}
            fontSize={12}
            domain={[Math.floor(minValue * 0.9), Math.ceil(maxValue * 1.1)]} // Better domain calculation
            tick={{ fill: 'rgba(44, 62, 80, 0.8)' }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <ChartTooltipContent
                    formatter={(value) => `€${value}`}
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
            radius={[6, 6, 0, 0]}
            maxBarSize={60}
            animationDuration={800}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
