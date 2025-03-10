
import React, { useState } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
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
  
  // Couleurs plus attrayantes pour le graphique - dégradé de bleus
  const COLORS = ['#3D5A80', '#507DBC', '#6E9DE4', '#94B9F2', '#C5D9F7'];
  
  // Utiliser le layout vertical sur mobile pour une meilleure lisibilité
  const layout = isMobile ? "vertical" : "horizontal";
  
  // Ajustements des marges et propriétés pour une meilleure lisibilité sur mobile
  const chartMargin = isMobile
    ? { top: 10, right: 10, bottom: 10, left: 100 }
    : { top: 20, right: 30, bottom: 40, left: 30 };
  
  // Taille des barres optimisée selon l'appareil
  const barSize = isMobile ? 15 : 30;
  
  // Espacement entre les barres
  const barGap = isMobile ? "5%" : "20%";
  
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
    <div className="h-full w-full min-h-[450px]">
      <ChartContainer 
        config={{
          [period]: {
            label: period === 'semaine' ? 'Leads par semaine' : 
                  period === 'mois' ? 'Leads par mois' : 'Leads par année',
            color: '#3D5A80'
          }
        }}
        className="h-full w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart 
            data={mockLeadsData}
            margin={chartMargin}
            barCategoryGap={barGap}
            onMouseLeave={handleMouseLeave}
            layout={layout}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(44, 62, 80, 0.1)" />
            <XAxis
              dataKey={layout === "vertical" ? period : "name"}
              type={layout === "vertical" ? "number" : "category"}
              tickLine={false}
              axisLine={false}
              padding={{ left: 20, right: 20 }}
              fontSize={isMobile ? 10 : 12}
              tick={{ fill: 'rgba(44, 62, 80, 0.8)' }}
              angle={isMobile && layout === "horizontal" ? -45 : 0}
              textAnchor={isMobile && layout === "horizontal" ? "end" : "middle"}
              height={isMobile && layout === "horizontal" ? 80 : 60}
              width={isMobile && layout === "vertical" ? 40 : undefined}
              tickFormatter={layout === "vertical" ? formatYAxis : undefined}
            />
            <YAxis
              dataKey={layout === "vertical" ? "name" : period}
              type={layout === "vertical" ? "category" : "number"}
              tickLine={false}
              axisLine={false}
              width={layout === "vertical" ? 90 : undefined}
              tickFormatter={layout === "vertical" ? undefined : formatYAxis}
              fontSize={isMobile ? 10 : 12}
              tick={{ fill: 'rgba(44, 62, 80, 0.8)' }}
              interval={0} // Afficher toutes les étiquettes
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
            {!isMobile && (
              <Legend 
                wrapperStyle={{ paddingTop: 20 }}
                formatter={(value: string) => (
                  <span className="text-sm text-foreground font-medium capitalize">
                    {value === 'semaine' ? 'Cette semaine' : 
                    value === 'mois' ? 'Ce mois' : 'Cette année'}
                  </span>
                )}
              />
            )}
            <Bar
              dataKey={period}
              radius={[4, 4, 0, 0]}
              maxBarSize={barSize}
              animationDuration={800}
              onMouseEnter={handleMouseEnter}
              className="hover:opacity-80 transition-opacity"
            >
              {mockLeadsData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  fillOpacity={activeBar === index ? 1 : 0.85}
                  style={{ filter: activeBar === index ? "drop-shadow(0 4px 3px rgba(0, 0, 0, 0.1))" : "none" }}
                />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default LeadsPerAgentChart;
