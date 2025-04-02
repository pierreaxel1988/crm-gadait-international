
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export interface LeadSourceDistributionProps {
  isLeadSources?: boolean;
  isBudgetDistribution?: boolean;
  isPropertyTypes?: boolean;
}

const LeadSourceDistribution: React.FC<LeadSourceDistributionProps> = ({ 
  isLeadSources = false,
  isBudgetDistribution = false,
  isPropertyTypes = false
}) => {
  // Default data for property type distribution
  let data = [
    { name: 'Appartements', value: 35 },
    { name: 'Villas', value: 25 },
    { name: 'Maisons', value: 20 },
    { name: 'Terrains', value: 15 },
    { name: 'Autres', value: 5 },
  ];
  
  // Data for lead sources if specified
  if (isLeadSources) {
    data = [
      { name: 'Site Web', value: 30 },
      { name: 'Portails', value: 25 },
      { name: 'Réseaux sociaux', value: 20 },
      { name: 'Partenariats', value: 15 },
      { name: 'Relations PR', value: 10 },
    ];
  }
  
  // Data for budget distribution if specified
  if (isBudgetDistribution) {
    data = [
      { name: '< 1M€', value: 20 },
      { name: '1-2M€', value: 30 },
      { name: '2-5M€', value: 25 },
      { name: '5-10M€', value: 15 },
      { name: '> 10M€', value: 10 },
    ];
  }
  
  // Custom colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={true}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value}%`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default LeadSourceDistribution;
