
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';
import { Period } from './PeriodSelector';

interface LeadsByPortalChartProps {
  period: Period;
}

const LeadsByPortalChart = ({ period }: LeadsByPortalChartProps) => {
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined);
  
  // Données mockées pour les leads par portail immobilier avec nombres absolus
  const data = useMemo(() => {
    // Dans une vraie application, ces données viendraient de l'API
    // en fonction de la période sélectionnée
    return [
      { name: 'Idealista', value: 28, count: 62 },
      { name: 'Le Figaro', value: 22, count: 49 },
      { name: 'Properstar', value: 18, count: 40 },
      { name: 'Property Cloud', value: 15, count: 33 },
      { name: "L'express Property", value: 17, count: 37 },
    ];
  }, [period]);
  
  // Palette de couleurs élégante pour les portails immobiliers
  const COLORS = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2'];
  
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
          <p className="text-sm text-muted-foreground">
            {`${payload[0].payload.count} leads (${Math.round(payload[0].payload.percent * 100)}%)`}
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="w-full h-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height={isMobile ? 300 : 360}>
        <PieChart 
          margin={{ top: 40, right: 0, bottom: 40, left: 0 }}
        >
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={isMobile ? 80 : 100}
            innerRadius={isMobile ? 50 : 65}
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
            wrapperStyle={{ paddingTop: 30 }}
            formatter={(value: string, entry: any) => (
              <span className="text-sm text-foreground font-medium">
                {`${value} (${entry.payload.count})`}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LeadsByPortalChart;
