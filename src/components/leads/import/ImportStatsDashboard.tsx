
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Bar, Cell, PieChart, Pie } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2, FileType, AlertCircle, CheckCircle } from 'lucide-react';

interface ImportStat {
  id: string;
  source_type: string;
  total_count: number;
  imported_count: number;
  updated_count: number;
  error_count: number;
  duplicates_count: number;
  import_date: string;
  created_at: string;
}

interface SourceStats {
  name: string;
  total: number;
  imported: number;
  updated: number;
  errors: number;
  duplicates: number;
}

const COLORS = ['#2C3E50', '#34495E', '#3D5A80', '#446A9E', '#4A7ABB', '#5D8CAD', '#6F9EBF'];

const ImportStatsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ImportStat[]>([]);
  const [sourceStats, setSourceStats] = useState<SourceStats[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchImportStats();
  }, []);

  const fetchImportStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('import_statistics')
        .select('*')
        .order('import_date', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      setStats(data as ImportStat[]);
      processSourceStats(data as ImportStat[]);
    } catch (err) {
      console.error('Error fetching import statistics:', err);
      setError('Impossible de charger les statistiques d\'importation');
    } finally {
      setLoading(false);
    }
  };

  const processSourceStats = (data: ImportStat[]) => {
    // Group by source
    const sourceMap = new Map<string, SourceStats>();
    
    data.forEach(stat => {
      if (!sourceMap.has(stat.source_type)) {
        sourceMap.set(stat.source_type, {
          name: stat.source_type,
          total: 0,
          imported: 0,
          updated: 0,
          errors: 0,
          duplicates: 0
        });
      }
      
      const source = sourceMap.get(stat.source_type)!;
      source.total += stat.total_count;
      source.imported += stat.imported_count;
      source.updated += stat.updated_count;
      source.errors += stat.error_count;
      source.duplicates += stat.duplicates_count;
    });
    
    setSourceStats(Array.from(sourceMap.values()));
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy HH:mm', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  const getSuccessRate = (stat: ImportStat) => {
    const successCount = stat.imported_count + stat.updated_count;
    const totalAttempted = stat.total_count;
    if (totalAttempted === 0) return 100;
    return Math.round((successCount / totalAttempted) * 100);
  };

  const getStatusBadge = (successRate: number) => {
    if (successRate >= 90) return <Badge className="bg-green-100 text-green-800 border-0">Excellent</Badge>;
    if (successRate >= 70) return <Badge className="bg-blue-100 text-blue-800 border-0">Bon</Badge>;
    if (successRate >= 50) return <Badge className="bg-yellow-100 text-yellow-800 border-0">Moyen</Badge>;
    return <Badge className="bg-red-100 text-red-800 border-0">Problématique</Badge>;
  };

  const renderLegend = () => {
    return (
      <div className="flex justify-center gap-4 text-sm mt-2">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-emerald-500 rounded mr-1"></div>
          <span>Importés</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
          <span>Mis à jour</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-amber-500 rounded mr-1"></div>
          <span>Doublons</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
          <span>Erreurs</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-loro-navy" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8 text-red-600">
          <AlertCircle className="h-6 w-6 mr-2" />
          {error}
        </CardContent>
      </Card>
    );
  }

  if (stats.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col justify-center items-center py-8 text-gray-500">
          <FileType className="h-12 w-12 mb-2" />
          <p>Aucune statistique d'importation disponible</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Statistiques d'importation de leads
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="history">Historique des imports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Performances par source</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Total leads</TableHead>
                      <TableHead className="text-right">Importés</TableHead>
                      <TableHead className="text-right">Mis à jour</TableHead>
                      <TableHead className="text-right">Doublons</TableHead>
                      <TableHead className="text-right">Erreurs</TableHead>
                      <TableHead className="text-right">Taux de succès</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sourceStats.map((source, i) => {
                      const successRate = Math.round(((source.imported + source.updated) / source.total) * 100);
                      return (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{source.name}</TableCell>
                          <TableCell className="text-right">{source.total}</TableCell>
                          <TableCell className="text-right">{source.imported}</TableCell>
                          <TableCell className="text-right">{source.updated}</TableCell>
                          <TableCell className="text-right">{source.duplicates}</TableCell>
                          <TableCell className="text-right">{source.errors}</TableCell>
                          <TableCell className="text-right">{successRate}%</TableCell>
                          <TableCell>{getStatusBadge(successRate)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Importés</TableHead>
                  <TableHead className="text-right">Mis à jour</TableHead>
                  <TableHead className="text-right">Doublons</TableHead>
                  <TableHead className="text-right">Erreurs</TableHead>
                  <TableHead className="text-right">Taux de succès</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((stat) => {
                  const successRate = getSuccessRate(stat);
                  return (
                    <TableRow key={stat.id}>
                      <TableCell>{formatDate(stat.import_date)}</TableCell>
                      <TableCell className="font-medium">{stat.source_type}</TableCell>
                      <TableCell className="text-right">{stat.total_count}</TableCell>
                      <TableCell className="text-right">{stat.imported_count}</TableCell>
                      <TableCell className="text-right">{stat.updated_count}</TableCell>
                      <TableCell className="text-right">{stat.duplicates_count}</TableCell>
                      <TableCell className="text-right">{stat.error_count}</TableCell>
                      <TableCell className="text-right">{successRate}%</TableCell>
                      <TableCell>{getStatusBadge(successRate)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ImportStatsDashboard;
