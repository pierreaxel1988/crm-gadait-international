
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAllProperties } from '@/services/propertyService';

const PropertyViewsChart = () => {
  const properties = getAllProperties();
  
  // Prendre les 5 premières propriétés et simuler des vues
  const topProperties = properties.slice(0, 5).map(property => ({
    name: property.title.length > 20 ? property.title.substring(0, 20) + '...' : property.title,
    views: Math.floor(Math.random() * 50) + 10 // Simuler des vues entre 10 et 60
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={topProperties}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" width={150} />
        <Tooltip
          formatter={(value: number) => [`${value} vues`, 'Nombre de vues']}
        />
        <Bar dataKey="views" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PropertyViewsChart;
