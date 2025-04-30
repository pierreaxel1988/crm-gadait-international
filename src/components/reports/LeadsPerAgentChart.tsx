
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
  
  // Couleurs premium pour le graphique - dégradé de bleus
  const COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];
  
  // Utiliser le layout vertical sur mobile pour une meilleure lisibilité
  const layout = isMobile ? "vertical" : "horizontal";
  
  // Ajustements des marges et propriétés pour une meilleure lisibilité
  const chartMargin = isMobile
    ? { top: 20, right: 20, bottom: 20, left: 100 }
    : { top: 30, right: 30, bottom: 40, left: 20 };
  
  // Taille des barres optimisée selon l'appareil
  const barSize = isMobile ? 20 : 40;
  
  // Espacement entre les barres
  const barGap = isMobile ? "8%" : "25%";
  
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
    <div className="h-full w-full flex-1 flex flex-col">
      <ChartContainer 
        config={{
          [period]: {
            label: period === 'semaine' ? 'Leads par semaine' : 
                  period === 'mois' ? 'Leads par mois' : 'Leads par année',
            color: '#2563EB'
          }
        }}
        className="h-full w-full flex-1"
      >
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart 
            data={mockLeadsData}
            margin={chartMargin}
            barCategoryGap={barGap}
            onMouseLeave={handleMouseLeave}
            layout={layout}
            className="pb-4"
          >
            <defs>
              {COLORS.map((color, index) => (
                <linearGradient key={`gradient-${index}`} id={`colorBar${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0, 0, 0, 0.06)" />
            <XAxis
              dataKey={layout === "vertical" ? period : "name"}
              type={layout === "vertical" ? "number" : "category"}
              tickLine={false}
              axisLine={false}
              padding={{ left: 20, right: 20 }}
              fontSize={isMobile ? 12 : 13}
              tick={{ fill: '#64748B' }}
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
              width={layout === "vertical" ? 110 : undefined}
              tickFormatter={layout === "vertical" ? undefined : formatYAxis}
              fontSize={isMobile ? 12 : 13}
              tick={{ fill: '#64748B' }}
              interval={0} // Afficher toutes les étiquettes
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
                      <p className="font-medium text-gray-800 mb-1">{label}</p>
                      <p className="text-blue-600 font-bold">
                        {payload[0].value} {' '}
                        <span className="text-gray-600 font-normal text-sm">leads</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            {!isMobile && (
              <Legend 
                wrapperStyle={{ paddingTop: 20 }}
                formatter={(value: string) => (
                  <span className="text-sm text-gray-600 font-medium capitalize">
                    {value === 'semaine' ? 'Cette semaine' : 
                    value === 'mois' ? 'Ce mois' : 'Cette année'}
                  </span>
                )}
              />
            )}
            <Bar
              dataKey={period}
              radius={[6, 6, 0, 0]}
              maxBarSize={barSize}
              animationDuration={800}
              onMouseEnter={handleMouseEnter}
              className="hover:opacity-80 transition-opacity"
            >
              {mockLeadsData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#colorBar${index % COLORS.length})`}
                  fillOpacity={activeBar === index ? 1 : 0.85}
                  style={{ 
                    filter: activeBar === index ? "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))" : "none",
                    transition: "all 0.3s ease"
                  }}
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
