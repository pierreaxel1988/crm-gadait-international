
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Legend
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface MarketingData {
  name: string;
  cost: number;
  leads: number;
  sales: number;
  revenue: number;
}

interface MarketingROIChartProps {
  data: MarketingData[];
  channelFilter: string;
}

const MarketingROIChart: React.FC<MarketingROIChartProps> = ({ data, channelFilter }) => {
  const isMobile = useIsMobile();
  
  // Filtrer les données si nécessaire
  const filteredData = channelFilter === 'all' 
    ? data 
    : data.filter(item => {
        if (channelFilter === 'web') return item.name === 'Site Web';
        if (channelFilter === 'portals') return item.name === 'Portails';
        if (channelFilter === 'social') return item.name === 'Réseaux sociaux';
        if (channelFilter === 'partners') return item.name === 'Partenariats';
        return true;
      });
  
  // Calculer le ROI pour chaque canal
  const roiData = filteredData.map(item => ({
    name: item.name,
    roi: Math.round((item.revenue - item.cost) / item.cost * 100),
    leads: item.leads,
    sales: item.sales,
    cost: item.cost
  }));
  
  // Couleurs pour les différentes barres
  const colors = ['#3D5A80', '#98C1D9', '#EE6C4D', '#293241', '#E0FBFC'];
  
  return (
    <ChartContainer
      config={{
        roi: {
          label: "ROI (%)",
          color: "#3D5A80"
        }
      }}
      className="w-full h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={roiData}
          margin={{ top: 20, right: 30, left: 30, bottom: 30 }}
          barCategoryGap={isMobile ? "20%" : "30%"}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(44, 62, 80, 0.1)" />
          <XAxis
            dataKey="name"
            tick={{ fill: 'rgba(44, 62, 80, 0.8)', fontSize: isMobile ? 10 : 12 }}
            tickLine={false}
            axisLine={false}
            angle={isMobile ? -45 : 0}
            textAnchor={isMobile ? "end" : "middle"}
            height={isMobile ? 70 : 30}
          />
          <YAxis
            tickFormatter={(value) => `${value}%`}
            tick={{ fill: 'rgba(44, 62, 80, 0.8)', fontSize: isMobile ? 10 : 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-white p-3 border shadow-md rounded-md text-sm">
                    <p className="font-medium mb-1">{label}</p>
                    <p className="text-green-600 font-semibold">ROI: {item.roi}%</p>
                    <div className="border-t my-1 pt-1">
                      <p>Leads générés: {item.leads}</p>
                      <p>Ventes réalisées: {item.sales}</p>
                      <p>Coût: €{item.cost.toLocaleString()}</p>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            formatter={(value) => <span className="text-xs font-medium">{value}</span>}
          />
          <Bar 
            dataKey="roi" 
            name="ROI (%)" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={isMobile ? 30 : 60}
            animationDuration={800}
          >
            {roiData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default MarketingROIChart;
