import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';

interface LeadSourceDistributionProps {
  isLeadSources?: boolean;
}

const LeadSourceDistribution = ({ isLeadSources = false }: LeadSourceDistributionProps) => {
  const isMobile = useIsMobile();
  
  // Données mockées pour la distribution des sources/types
  const data = isLeadSources ? [
    { name: 'Site web', value: 35 },
    { name: 'Référence', value: 25 },
    { name: 'Réseaux sociaux', value: 20 },
    { name: 'Événements', value: 15 },
    { name: 'Autre', value: 5 },
  ] : [
    { name: 'Villa', value: 40 },
    { name: 'Appartement', value: 30 },
    { name: 'Penthouse', value: 20 },
    { name: 'Maison', value: 10 },
  ];
  
  const COLORS = ['#2C3E50', '#34495E', '#3D5A80', '#446A9E', '#6A8CBB'];
  
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (isMobile) return null; // Hide labels on mobile
    
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
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={isMobile ? 100 : 150}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value}%`, 'Pourcentage']}
            contentStyle={{ 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            align="center"
            layout={isMobile ? "vertical" : "horizontal"}
            iconType="circle"
            iconSize={10}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LeadSourceDistribution;
