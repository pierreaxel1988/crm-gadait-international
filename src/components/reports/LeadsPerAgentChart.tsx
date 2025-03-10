
import React, { useState } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useIsMobile } from '@/hooks/use-mobile';

interface LeadsData {
  name: string;
  semaine: number;
  mois: number;
  annee: number;
}

// En situation réelle, ces données viendraient de la base de données Supabase
const mockLeadsData: LeadsData[] = [
  { name: 'Jade Diouane', semaine: 4, mois: 12, annee: 85 },
  { name: 'Ophelie Durand', semaine: 3, mois: 10, annee: 62 },
  { name: 'Jean Marc Perrissol', semaine: 2, mois: 8, annee: 54 },
  { name: 'Jacques Charles', semaine: 3, mois: 9, annee: 48 },
  { name: 'Sharon Ramdiane', semaine: 1, mois: 7, annee: 35 },
];

interface LeadsPerAgentChartProps {
  period: 'semaine' | 'mois' | 'annee';
}

const LeadsPerAgentChart = ({ period }: LeadsPerAgentChartProps) => {
  const isMobile = useIsMobile();
  const [activeBar, setActiveBar] = useState<number | null>(null);
  
  // Couleurs élégantes pour le graphique - palette sophistiquée
  const barColor = '#3D5A80';
  
  const formatYAxis = (value: number) => {
    return value.toString();
  };
  
  const handleMouseEnter = (_: any, index: number) => {
    setActiveBar(index);
  };
  
  const handleMouseLeave = () => {
    setActiveBar(null);
  };
  
  return (
    <ChartContainer 
      config={{
        [period]: {
          label: period === 'semaine' ? 'Leads par semaine' : 
                 period === 'mois' ? 'Leads par mois' : 'Leads par année',
          color: barColor
        }
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart 
          data={mockLeadsData}
          margin={{ top: 20, right: 30, bottom: 40, left: 30 }}
          barCategoryGap="20%"
          onMouseLeave={handleMouseLeave}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(44, 62, 80, 0.1)" />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            padding={{ left: 20, right: 20 }}
            fontSize={12}
            tick={{ fill: 'rgba(44, 62, 80, 0.8)' }}
            angle={isMobile ? -45 : 0}
            textAnchor={isMobile ? "end" : "middle"}
            height={isMobile ? 80 : 60}
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
                    active={active}
                    payload={payload}
                    label={label}
                  />
                );
              }
              return null;
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: 20 }}
            formatter={(value: string) => (
              <span className="text-sm text-foreground font-medium capitalize">
                {value === 'semaine' ? 'Cette semaine' : 
                 value === 'mois' ? 'Ce mois' : 'Cette année'}
              </span>
            )}
          />
          <Bar
            dataKey={period}
            radius={[4, 4, 0, 0]}
            fill={barColor}
            maxBarSize={60}
            animationDuration={800}
            onMouseEnter={handleMouseEnter}
            className={`hover:opacity-80 transition-opacity`}
            style={{ 
              filter: activeBar !== null ? "drop-shadow(0 4px 3px rgba(0, 0, 0, 0.07))" : "none" 
            }}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default LeadsPerAgentChart;
