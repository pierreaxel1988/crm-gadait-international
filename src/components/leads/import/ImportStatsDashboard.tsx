
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, FileType, AlertCircle, CheckCircle } from 'lucide-react';
import { useImportStats } from './hooks/useImportStats';
import StatsOverview from './components/StatsOverview';
import ImportHistoryTable from './components/ImportHistoryTable';

const ImportStatsDashboard: React.FC = () => {
  const { loading, error, stats, sourceStats, activeTab, setActiveTab } = useImportStats();

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
            <StatsOverview sourceStats={sourceStats} />
          </TabsContent>
          
          <TabsContent value="history">
            <ImportHistoryTable stats={stats} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ImportStatsDashboard;
