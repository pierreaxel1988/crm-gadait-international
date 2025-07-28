import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChartDataForm from '@/components/admin/ChartDataForm';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { BarChart3, Settings2, Users, Trash2, Download, TrendingUp, Activity } from 'lucide-react';
import UsersManagement from '@/components/admin/UsersManagement';
import DeletedLeadsManagement from '@/components/admin/DeletedLeadsManagement';
import LeadsExport from '@/components/admin/LeadsExport';
import SourceAnalytics from '@/components/admin/SourceAnalytics';
import SalesAnalytics from '@/components/admin/SalesAnalytics';

// Données mockées initiales pour le graphique
const initialChartData = [
  { name: 'Jan', total: 1200 },
  { name: 'Feb', total: 1900 },
  { name: 'Mar', total: 2100 },
  { name: 'Apr', total: 1800 },
  { name: 'May', total: 2800 },
  { name: 'Jun', total: 2300 },
  { name: 'Jul', total: 3500 }
];

const Admin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get('tab') || 'chart-data';

  const handleTabChange = (value: string) => {
    navigate(`/admin?tab=${value}`);
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-[1920px] mx-auto bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-futuraMd">Administration</h1>
          <p className="text-muted-foreground mt-1">Gérez les données et paramètres de votre application.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="chart-data">Données du graphique</TabsTrigger>
          <TabsTrigger value="analytics">Analyse des sources</TabsTrigger>
          <TabsTrigger value="sales-analytics">Activité commerciaux</TabsTrigger>
          <TabsTrigger value="export">Export Leads</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="deleted-leads">Corbeille</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chart-data" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardCard 
              title="Modifier les données" 
              subtitle="Configurez les valeurs pour le graphique d'acquisition de leads" 
              className="h-full"
            >
              <div className="h-full pt-4">
                <ChartDataForm initialData={initialChartData} />
              </div>
            </DashboardCard>
            
            <DashboardCard 
              title="Aperçu" 
              subtitle="Visualisez les modifications en temps réel" 
              icon={<BarChart3 className="h-5 w-5" />}
              className="h-full"
            >
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">L'aperçu sera implémenté prochainement</p>
              </div>
            </DashboardCard>
          </div>
        </TabsContent>

        <TabsContent value="sales-analytics" className="space-y-6">
          <DashboardCard 
            title="Activité des commerciaux" 
            subtitle="Analysez les performances et l'activité de votre équipe commerciale"
            icon={<Activity className="h-5 w-5" />}
          >
            <SalesAnalytics />
          </DashboardCard>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <SourceAnalytics />
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <DashboardCard 
            title="Export des leads" 
            subtitle="Exportez votre base de données pour vos campagnes mailing"
            icon={<Download className="h-5 w-5" />}
          >
            <LeadsExport />
          </DashboardCard>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <DashboardCard 
            title="Paramètres généraux" 
            subtitle="Configurez les paramètres de l'application"
            icon={<Settings2 className="h-5 w-5" />}
          >
            <div className="p-6">
              <p className="text-muted-foreground">Les paramètres seront disponibles prochainement</p>
            </div>
          </DashboardCard>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <DashboardCard 
            title="Gestion des utilisateurs" 
            subtitle="Ajoutez, modifiez ou supprimez des utilisateurs"
            icon={<Users className="h-5 w-5" />}
          >
            <UsersManagement />
          </DashboardCard>
        </TabsContent>

        <TabsContent value="deleted-leads" className="space-y-6">
          <DashboardCard 
            title="Leads supprimés" 
            subtitle="Visualisez et restaurez les leads dans la corbeille"
            icon={<Trash2 className="h-5 w-5" />}
          >
            <DeletedLeadsManagement />
          </DashboardCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
