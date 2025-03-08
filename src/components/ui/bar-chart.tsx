
import * as React from 'react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  TooltipProps
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from './chart';

interface BarChartProps {
  data: {
    name: string;
    total: number;
  }[];
}

export function BarChart({ data }: BarChartProps) {
  return (
    <ChartContainer 
      config={{
        total: {
          label: "Total",
          color: "hsl(var(--primary))"
        }
      }}
    >
      <RechartsBarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          padding={{ left: 10, right: 10 }}
          fontSize={12}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `€${value}`}
          fontSize={12}
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
          radius={[4, 4, 0, 0]}
          fill="var(--color-total)"
          maxBarSize={40}
        />
      </RechartsBarChart>
    </ChartContainer>
  );
}
