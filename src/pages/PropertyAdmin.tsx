
import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, ChartBar, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart } from "@/components/ui/bar-chart";
import DashboardCard from "@/components/dashboard/DashboardCard";

interface ImportStats {
  id: string;
  source_type: string;
  import_date: string;
  imported_count: number;
  updated_count: number;
  error_count: number;
  total_count: number;
  created_at: string;
}

const PropertyAdmin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [importStats, setImportStats] = useState<ImportStats[]>([]);
  const [chartData, setChartData] = useState<{ name: string; total: number }[]>([]);

  // Charger les statistiques d'importation
  useEffect(() => {
    fetchImportStats();
  }, []);

  const fetchImportStats = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('import_statistics')
        .select('*')
        .order('import_date', { ascending: false })
        .limit(10);

      if (error) throw error;

      setImportStats(data || []);
      
      // Préparer les données pour le graphique
      if (data && data.length > 0) {
        const chartData = data.slice(0, 7).reverse().map(stat => ({
          name: new Date(stat.import_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
          total: stat.total_count
        }));
        
        setChartData(chartData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques d'importation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerSync = async (url?: string) => {
    setIsSyncing(true);
    try {
      toast({
        title: "Synchronisation démarrée",
        description: "La synchronisation des propriétés est en cours...",
      });

      const payload: any = {};
      if (url) {
        payload.url = url;
      }

      const { data, error } = await supabase.functions.invoke('properties-sync', {
        body: payload
      });

      if (error) throw error;

      toast({
        title: "Synchronisation terminée",
        description: data.message || "Les propriétés ont été synchronisées avec succès",
      });
      
      // Rafraîchir les statistiques après la synchronisation
      fetchImportStats();
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      toast({
        title: "Erreur de synchronisation",
        description: "Une erreur s'est produite lors de la synchronisation des propriétés",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('fr-FR');
  };

  return (
    <div className="p-6 space-y-8 container mx-auto max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Administration des propriétés</h1>
        <p className="text-muted-foreground mt-2">
          Gérez les synchronisations de propriétés et visualisez les statistiques d'importation
        </p>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
          <TabsTrigger value="stats">Statistiques détaillées</TabsTrigger>
          <TabsTrigger value="sync">Synchronisation</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <DashboardCard 
              title="Propriétés importées" 
              value={importStats[0]?.imported_count?.toString() || "0"} 
              subtitle="Dernière synchronisation" 
              icon={<Download className="h-5 w-5" />}
            />
            <DashboardCard 
              title="Propriétés mises à jour" 
              value={importStats[0]?.updated_count?.toString() || "0"} 
              subtitle="Dernière synchronisation" 
              icon={<RefreshCw className="h-5 w-5" />} 
            />
            <DashboardCard 
              title="Dernière mise à jour" 
              value={importStats[0] ? formatDate(importStats[0].import_date).split(' ')[0] : "Jamais"} 
              subtitle={importStats[0] ? formatDate(importStats[0].import_date).split(' ')[1] : ""}
              icon={<Settings className="h-5 w-5" />}
            />
          </div>

          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Évolution des propriétés synchronisées</CardTitle>
                <CardDescription>
                  Nombre total de propriétés extraites par date
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <BarChart data={chartData} />
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="flex justify-end">
            <Button 
              onClick={() => triggerSync()} 
              disabled={isSyncing}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {isSyncing ? 'Synchronisation en cours...' : 'Synchroniser maintenant'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Historique des synchronisations</CardTitle>
              <CardDescription>
                Dernières synchronisations de propriétés effectuées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>
                  {isLoading 
                    ? 'Chargement des statistiques...' 
                    : `Affichage des ${importStats.length} dernières synchronisations`
                  }
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Nouvelles</TableHead>
                    <TableHead>Mises à jour</TableHead>
                    <TableHead>Erreurs</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importStats.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Aucune statistique d'importation disponible
                      </TableCell>
                    </TableRow>
                  )}
                  {importStats.map((stat) => (
                    <TableRow key={stat.id}>
                      <TableCell>{stat.source_type}</TableCell>
                      <TableCell>{formatDate(stat.import_date)}</TableCell>
                      <TableCell>{stat.imported_count}</TableCell>
                      <TableCell>{stat.updated_count}</TableCell>
                      <TableCell>{stat.error_count}</TableCell>
                      <TableCell>{stat.total_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4">
                <Button 
                  variant="outline" 
                  onClick={fetchImportStats} 
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {isLoading ? 'Chargement...' : 'Rafraîchir les statistiques'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Synchronisation générale</CardTitle>
                <CardDescription>
                  Synchroniser toutes les propriétés de The Private Collection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Lance une synchronisation de toutes les propriétés disponibles sur le site The Private Collection.
                  Cette opération peut prendre quelques minutes.
                </p>
                <Button 
                  onClick={() => triggerSync("https://the-private-collection.com/en/search/")} 
                  disabled={isSyncing} 
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Synchroniser toutes les propriétés
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Synchronisation par pays</CardTitle>
                <CardDescription>
                  Synchroniser les propriétés par pays spécifique
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => triggerSync("https://the-private-collection.com/en/search/mauritius")} 
                    disabled={isSyncing}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Maurice
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => triggerSync("https://the-private-collection.com/en/search/morocco")} 
                    disabled={isSyncing}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Maroc
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => triggerSync("https://the-private-collection.com/en/search/spain")} 
                    disabled={isSyncing}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Espagne
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyAdmin;
