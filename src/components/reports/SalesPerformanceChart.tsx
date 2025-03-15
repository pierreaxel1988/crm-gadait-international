import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';

interface SalesPerformanceChartProps {
  data: {
    name: string;
    total: number;
    status?: string;
  }[];
  isConversionFunnel?: boolean;
}

const SalesPerformanceChart = ({ data, isConversionFunnel = false }: SalesPerformanceChartProps) => {
  const isMobile = useIsMobile();
  
  // Palette de couleurs améliorée avec une progression plus claire pour le parcours de conversion
  const COLORS = isConversionFunnel 
    ? ['#1E40AF', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE', '#EFF6FF', '#F8FAFC']
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
  
  // Formatter personnalisé pour le tooltip du funnel de conversion
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const statName = data.name;
      const statValue = data.total;
      const prevStage = data.prevTotal || 0;
      const conversionRate = prevStage ? Math.round((statValue / prevStage) * 100) : 100;
      
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-md shadow-md border dark:border-slate-700">
          <div className="font-medium text-foreground">{statName}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            <div>Nombre: <span className="font-medium">{statValue}</span></div>
            {prevStage > 0 && (
              <div>
                Taux de conversion: <span className="font-medium">{conversionRate}%</span> 
                <span className="text-xs ml-1">({statValue}/{prevStage})</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Ajout des données de conversion pour le funnel
  const enhancedData = React.useMemo(() => {
    if (!isConversionFunnel) return data;
    
    return data.map((item, index) => {
      const prevTotal = index > 0 ? data[index - 1].total : null;
      return {
        ...item,
        prevTotal,
        conversionRate: prevTotal ? Math.round((item.total / prevTotal) * 100) : 100
      };
    });
  }, [data, isConversionFunnel]);
  
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
          data={enhancedData}
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
          <Tooltip content={isConversionFunnel ? CustomTooltip : undefined} />
          <Bar
            dataKey="total"
            radius={[4, 4, 0, 0]}
            maxBarSize={barSize}
            animationDuration={800}
          >
            {enhancedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                fillOpacity={0.9}
              />
            ))}
            <LabelList 
              dataKey="total" 
              position={layout === "vertical" ? "right" : "top"} 
              style={{ 
                fontSize: fontSize, 
                fill: '#2C3E50',
                fontWeight: 600 
              }} 
              offset={5} 
            />
            {isConversionFunnel && layout === "horizontal" && (
              <LabelList 
                dataKey="conversionRate" 
                position="insideTop" 
                style={{ 
                  fontSize: fontSize - 2, 
                  fill: '#FFFFFF',
                  fontWeight: 500 
                }} 
                formatter={(value: any) => (value !== 100 ? `${value}%` : '')}
                offset={-15} 
              />
            )}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default SalesPerformanceChart;
