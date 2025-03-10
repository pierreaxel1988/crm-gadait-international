
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getLeads } from '@/services/leadService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const LeadStatusPieChart = () => {
  // Obtenir les données des leads
  const allLeads = getLeads();
  
  // Compter les leads par statut
  const statusCounts: Record<string, number> = {};
  allLeads.forEach(lead => {
    statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
  });
  
  // Transformer les données pour le graphique
  const data = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [`${value} leads`, 'Quantité']}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default LeadStatusPieChart;
