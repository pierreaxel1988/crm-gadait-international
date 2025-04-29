
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
import { Skeleton } from '@/components/ui/skeleton';

interface SalesPerformanceChartProps {
  data: {
    name: string;
    total: number;
  }[];
  isConversionFunnel?: boolean;
  isLoading?: boolean;
}

const SalesPerformanceChart = ({ 
  data,
  isConversionFunnel = false,
  isLoading = false
}: SalesPerformanceChartProps) => {
  const isMobile = useIsMobile();
  
  // Palette de couleurs améliorée avec une progression plus claire
  const COLORS = isConversionFunnel 
    ? ['#0D47A1', '#1565C0', '#1976D2', '#1E88E5', '#2196F3', '#42A5F5', '#64B5F6', '#90CAF9', '#BBDEFB']
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

  // Toujours utiliser une disposition verticale sur mobile pour le funnel
  const layout = isMobile && isConversionFunnel ? "vertical" : "horizontal";
  
  // Ajustement des marges et autres propriétés pour une meilleure lisibilité sur mobile
  const chartMargin = isMobile
    ? { top: 10, right: 20, bottom: 10, left: isConversionFunnel ? 120 : 40 }
    : { top: 20, right: 30, bottom: 30, left: 30 };

  // Taille des barres optimisée pour mobile
  const barSize = isMobile
    ? (isConversionFunnel ? 18 : 30)
    : (isConversionFunnel ? 30 : 60);

  // Espacement entre les barres
  const barGap = isMobile
    ? (isConversionFunnel ? "2%" : "8%")
    : (isConversionFunnel ? "8%" : "15%");

  // Taille de police adaptative
  const fontSize = isMobile ? 10 : 12;
  
  // Si en chargement, afficher un skeleton
  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }
  
  // Si pas de données, afficher un message
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-gray-500">Aucune donnée disponible</p>
      </div>
    );
  }
  
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
          layout={layout}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(44, 62, 80, 0.1)" />
          <XAxis
            dataKey={layout === "vertical" ? "total" : "name"}
            type={layout === "vertical" ? "number" : "category"}
            tickLine={false}
            axisLine={false}
            padding={{ left: 20, right: 20 }}
            fontSize={fontSize}
            tick={{ fill: 'rgba(44, 62, 80, 0.8)' }}
            angle={isMobile && layout === "horizontal" ? -45 : 0}
            textAnchor={isMobile && layout === "horizontal" ? "end" : "middle"}
            height={isMobile && layout === "horizontal" ? 70 : 30}
            width={isMobile && layout === "vertical" ? 40 : undefined}
            tickFormatter={layout === "vertical" ? formatYAxis : undefined}
            interval={0} // Afficher toutes les étiquettes
          />
          <YAxis
            dataKey={layout === "vertical" ? "name" : "total"}
            type={layout === "vertical" ? "category" : "number"}
            tickLine={false}
            axisLine={false}
            width={layout === "vertical" ? 110 : undefined}
            tickFormatter={layout === "vertical" ? undefined : formatYAxis}
            fontSize={fontSize}
            tick={{ fill: 'rgba(44, 62, 80, 0.8)' }}
            interval={0} // Afficher toutes les étiquettes
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
            maxBarSize={barSize}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                fillOpacity={0.9}
              />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default SalesPerformanceChart;
