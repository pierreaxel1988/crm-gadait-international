
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChartDataForm from '@/components/admin/ChartDataForm';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { BarChart3, Settings2, Users } from 'lucide-react';
import UsersManagement from '@/components/admin/UsersManagement';

// Données mockées initiales pour le graphique
const initialChartData = [{
  name: 'Jan',
  total: 1200
}, {
  name: 'Feb',
  total: 1900
}, {
  name: 'Mar',
  total: 2100
}, {
  name: 'Apr',
  total: 1800
}, {
  name: 'May',
  total: 2800
}, {
  name: 'Jun',
  total: 2300
}, {
  name: 'Jul',
  total: 3500
}];
const Admin = () => {
  return <div className="p-6 lg:p-10 space-y-8 max-w-[1920px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-futura">Administration</h1>
          <p className="text-muted-foreground mt-1">Gérez les données et paramètres de votre application.</p>
        </div>
      </div>

      <Tabs defaultValue="chart-data" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="chart-data">Données du graphique</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chart-data" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardCard title="Modifier les données" subtitle="Configurez les valeurs pour le graphique d'acquisition de leads" className="h-full">
              <div className="h-full pt-4">
                <ChartDataForm initialData={initialChartData} />
              </div>
            </DashboardCard>
            
            <DashboardCard title="Aperçu" subtitle="Visualisez les modifications en temps réel" icon={<BarChart3 className="h-5 w-5" />} className="h-full">
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">L'aperçu sera implémenté prochainement</p>
              </div>
            </DashboardCard>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <DashboardCard title="Paramètres généraux" subtitle="Configurez les paramètres de l'application" icon={<Settings2 className="h-5 w-5" />}>
            <div className="p-6">
              <p className="text-muted-foreground">Les paramètres seront disponibles prochainement</p>
            </div>
          </DashboardCard>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <DashboardCard title="Gestion des utilisateurs" subtitle="Ajoutez, modifiez ou supprimez des utilisateurs" icon={<Users className="h-5 w-5" />}>
            <UsersManagement />
          </DashboardCard>
        </TabsContent>
      </Tabs>
    </div>;
};
export default Admin;
