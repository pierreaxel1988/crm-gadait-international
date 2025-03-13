
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { SourceStats } from '../utils/statsUtils';

interface SourceBarChartProps {
  sourceStats: SourceStats[];
}

const SourceBarChart: React.FC<SourceBarChartProps> = ({ sourceStats }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Statistiques par source</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sourceStats}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="imported" name="Importés" stackId="a" fill="#10b981" />
              <Bar dataKey="updated" name="Mis à jour" stackId="a" fill="#3b82f6" />
              <Bar dataKey="duplicates" name="Doublons" stackId="a" fill="#f59e0b" />
              <Bar dataKey="errors" name="Erreurs" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SourceBarChart;
