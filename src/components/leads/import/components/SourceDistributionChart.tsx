
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, ResponsiveContainer, Pie, Tooltip, Cell } from 'recharts';
import { SourceStats, COLORS } from '../utils/statsUtils';

interface SourceDistributionChartProps {
  sourceStats: SourceStats[];
}

const SourceDistributionChart: React.FC<SourceDistributionChartProps> = ({ sourceStats }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Répartition des sources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sourceStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="total"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {sourceStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} leads`, 'Total']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SourceDistributionChart;
