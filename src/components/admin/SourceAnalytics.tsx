import React, { useState, useEffect } from 'react';
import { Calendar, Download, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SourceData {
  source: string;
  count: number;
  percentage: number;
}

interface MonthlyData {
  month: string;
  [key: string]: string | number;
}

const COLORS = [
  '#8B7355', // Taupe
  '#A0956B', // Beige doré
  '#6B5B73', // Mauve grisé
  '#9B8579', // Café au lait
  '#7A8471', // Vert olive
  '#B5A288', // Sable
  '#8E7B68', // Châtaigne
  '#A69C8E', // Gris chaud
  '#9D8B7A', // Mushroom
  '#786B5E'  // Graphite chaud
];

const SourceAnalytics = () => {
  const [startDate, setStartDate] = useState(format(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [sourceData, setSourceData] = useState<SourceData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Récupérer les données par source pour la période
      const { data: sourceStats, error: sourceError } = await supabase
        .from('leads')
        .select('source, created_at')
        .gte('created_at', startDate + 'T00:00:00')
        .lte('created_at', endDate + 'T23:59:59')
        .is('deleted_at', null);

      if (sourceError) throw sourceError;

      // Traitement des données par source
      const sourceCounts: { [key: string]: number } = {};
      sourceStats?.forEach(lead => {
        const source = lead.source || 'Non défini';
        sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      });

      const total = Object.values(sourceCounts).reduce((sum, count) => sum + count, 0);
      setTotalLeads(total);

      const sourceDataProcessed = Object.entries(sourceCounts)
        .map(([source, count]) => ({
          source,
          count,
          percentage: Math.round((count / total) * 100)
        }))
        .sort((a, b) => b.count - a.count);

      setSourceData(sourceDataProcessed);

      // Récupérer les données mensuelles
      const { data: monthlyStats, error: monthlyError } = await supabase
        .from('leads')
        .select('source, created_at')
        .gte('created_at', startDate + 'T00:00:00')
        .lte('created_at', endDate + 'T23:59:59')
        .is('deleted_at', null)
        .order('created_at');

      if (monthlyError) throw monthlyError;

      // Traitement des données mensuelles
      const monthlyMap: { [key: string]: { [source: string]: number } } = {};
      monthlyStats?.forEach(lead => {
        const month = format(new Date(lead.created_at), 'MMM yyyy', { locale: fr });
        const source = lead.source || 'Non défini';
        
        if (!monthlyMap[month]) monthlyMap[month] = {};
        monthlyMap[month][source] = (monthlyMap[month][source] || 0) + 1;
      });

      const monthlyDataProcessed = Object.entries(monthlyMap).map(([month, sources]) => ({
        month,
        ...sources
      }));

      setMonthlyData(monthlyDataProcessed);

    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [startDate, endDate]);

  const exportToCSV = () => {
    const csvContent = [
      ['Source', 'Nombre de leads', 'Pourcentage'],
      ...sourceData.map(item => [item.source, item.count, `${item.percentage}%`])
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analyse-sources-${startDate}-${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Filtres de période */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-normal">
            <Calendar className="h-5 w-5" />
            Période d'analyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="start-date">Date de début</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="end-date">Date de fin</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button onClick={fetchAnalytics} disabled={loading}>
              {loading ? 'Chargement...' : 'Actualiser'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Résumé */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between font-normal">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Résumé de la période
            </span>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl text-primary">
            {totalLeads} leads au total
          </div>
          <div className="text-sm text-muted-foreground">
            Du {format(new Date(startDate), 'dd MMMM yyyy', { locale: fr })} au{' '}
            {format(new Date(endDate), 'dd MMMM yyyy', { locale: fr })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique en barres */}
        <Card>
          <CardHeader>
            <CardTitle className="font-normal">Répartition par source</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="source" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count">
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Graphique en secteurs */}
        <Card>
          <CardHeader>
            <CardTitle className="font-normal">Répartition en pourcentage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 h-[300px]">
              {/* Légende à gauche */}
              <div className="space-y-2 flex flex-col justify-center">
                {sourceData.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{item.source}</div>
                      <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Camembert à droite */}
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} leads`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau détaillé */}
      <Card>
        <CardHeader>
          <CardTitle className="font-normal">Détail par source</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Source</th>
                  <th className="text-right p-2">Nombre de leads</th>
                  <th className="text-right p-2">Pourcentage</th>
                </tr>
              </thead>
              <tbody>
                {sourceData.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{item.source}</td>
                    <td className="text-right p-2">{item.count}</td>
                    <td className="text-right p-2">{item.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Évolution mensuelle */}
      {monthlyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-normal">Évolution mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                {Object.keys(monthlyData[0] || {})
                  .filter(key => key !== 'month')
                  .map((source, index) => (
                    <Bar
                      key={source}
                      dataKey={source}
                      stackId="sources"
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SourceAnalytics;