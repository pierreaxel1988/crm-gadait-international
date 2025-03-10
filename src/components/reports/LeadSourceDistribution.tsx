
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';
import { LeadSource, PropertyType } from '@/types/lead';

interface LeadSourceDistributionProps {
  isLeadSources?: boolean;
}

const LeadSourceDistribution = ({ isLeadSources = false }: LeadSourceDistributionProps) => {
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  
  // Données mockées pour la distribution des sources/types
  const data = isLeadSources ? [
    { name: 'Site web', value: 30 },
    { name: 'Réseaux sociaux', value: 15 },
    { name: 'Portails immobiliers', value: 20 },
    { name: 'Network', value: 10 },
    { name: 'Repeaters', value: 8 },
    { name: 'Recommandations', value: 12 },
    { name: "Apporteur d'affaire", value: 5 },
  ] : [
    { name: 'Villa', value: 40 },
    { name: 'Appartement', value: 30 },
    { name: 'Penthouse', value: 20 },
    { name: 'Maison', value: 10 },
  ];
  
  // Custom color palette with more elegant, sophisticated colors
  const COLORS = isLeadSources 
    ? ['#9b87f5', '#33C3F0', '#FEC6A1', '#D3E4FD', '#E5DEFF', '#7E69AB', '#8E9196'] 
    : ['#2C3E50', '#7E69AB', '#6E59A5', '#1A1F2C'];
  
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  
  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          className="filter drop-shadow-md"
        />
      </g>
    );
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    if (isMobile || innerRadius > 60) return null;
    
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="semibold"
        className="select-none"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-md shadow-md border dark:border-slate-700 text-left">
          <p className="font-medium text-foreground">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">{`${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="w-full h-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height={isMobile ? 280 : 350}>
        <PieChart 
          margin={{ top: 0, right: 0, bottom: 20, left: 0 }} // Added bottom margin
        >
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="45%" // Shifted up to prevent overflow
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={isMobile ? 85 : 120} // Slightly reduced
            innerRadius={isMobile ? 55 : 75} // Slightly reduced
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            animationDuration={800}
            animationBegin={300}
            animationEasing="ease-out"
            className="drop-shadow-sm"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                stroke="transparent"
                className="hover:opacity-90 transition-opacity"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom"
            align="center"
            layout="horizontal"
            iconType="circle"
            iconSize={10}
            wrapperStyle={{ paddingTop: 20 }} // Add padding at the top of the legend
            formatter={(value: string) => (
              <span className="text-sm text-foreground font-medium">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LeadSourceDistribution;
