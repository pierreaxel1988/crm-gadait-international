
import React, { useState } from 'react';
import { CalendarRange, Filter, PieChart, BarChart3, ArrowDownUp, Download } from 'lucide-react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { BarChart } from '@/components/ui/bar-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SalesPerformanceChart from '@/components/reports/SalesPerformanceChart';
import LeadSourceDistribution from '@/components/reports/LeadSourceDistribution';
import TopAgentsTable from '@/components/reports/TopAgentsTable';
import ConversionRateCard from '@/components/reports/ConversionRateCard';

const Reports = () => {
  const [period, setPeriod] = useState('month');
  
  // Données mockées pour le graphique des ventes
  const salesData = [
    { name: 'Jan', total: 250000 },
    { name: 'Feb', total: 420000 },
    { name: 'Mar', total: 380000 },
    { name: 'Apr', total: 520000 },
    { name: 'May', total: 350000 },
    { name: 'Jun', total: 620000 },
    { name: 'Jul', total: 780000 },
  ];
  
  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1920px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold">Rapports</h1>
          <p className="text-muted-foreground mt-1">Analysez les performances et visualisez les tendances</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <div className="flex items-center gap-2">
                <CalendarRange className="h-4 w-4" />
                <SelectValue placeholder="Période" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" className="w-full sm:w-auto">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="mb-6 flex flex-wrap">
          <TabsTrigger value="performance" className="flex-1 sm:flex-none">Performance</TabsTrigger>
          <TabsTrigger value="leads" className="flex-1 sm:flex-none">Leads</TabsTrigger>
          <TabsTrigger value="conversion" className="flex-1 sm:flex-none">Conversion</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ConversionRateCard 
              title="Taux de conversion" 
              value={28} 
              change={12} 
              period="vs dernier mois"
            />
            <ConversionRateCard 
              title="Valeur moyenne" 
              value="€1.2M" 
              change={-5} 
              period="vs dernier mois"
            />
            <ConversionRateCard 
              title="Temps moyen de conversion" 
              value="45 jours" 
              change={-8} 
              period="vs dernier mois"
              inverse
            />
          </div>
          
          <DashboardCard 
            title="Performance des ventes" 
            subtitle="Montant total des ventes par mois" 
            icon={<BarChart3 className="h-5 w-5" />}
            className="h-[400px] lg:h-[500px]"
          >
            <div className="h-full w-full pt-2">
              <SalesPerformanceChart data={salesData} />
            </div>
          </DashboardCard>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopAgentsTable />
            
            <DashboardCard 
              title="Distribution par type de propriété" 
              subtitle="Répartition des ventes par catégorie" 
              icon={<PieChart className="h-5 w-5" />}
              className="h-[400px]"
            >
              <div className="h-[350px] flex items-center justify-center">
                <LeadSourceDistribution />
              </div>
            </DashboardCard>
          </div>
        </TabsContent>
        
        <TabsContent value="leads" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ConversionRateCard 
              title="Nouveaux leads" 
              value={124} 
              change={8} 
              period="vs dernier mois"
            />
            <ConversionRateCard 
              title="Taux de qualification" 
              value="62%" 
              change={4} 
              period="vs dernier mois"
            />
            <ConversionRateCard 
              title="Coût par lead" 
              value="€45" 
              change={-12} 
              period="vs dernier mois"
              inverse
            />
          </div>
          
          <DashboardCard 
            title="Origine des leads" 
            subtitle="Distribution par source d'acquisition" 
            icon={<Filter className="h-5 w-5" />}
          >
            <div className="h-[400px] flex items-center justify-center">
              <LeadSourceDistribution isLeadSources />
            </div>
          </DashboardCard>
        </TabsContent>
        
        <TabsContent value="conversion" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ConversionRateCard 
              title="Taux de visite" 
              value="38%" 
              change={15} 
              period="vs dernier mois"
            />
            <ConversionRateCard 
              title="Taux d'offre" 
              value="18%" 
              change={-2} 
              period="vs dernier mois"
            />
            <ConversionRateCard 
              title="Taux de signature" 
              value="72%" 
              change={5} 
              period="vs dernier mois"
            />
          </div>
          
          <DashboardCard 
            title="Parcours de conversion" 
            subtitle="Évolution du statut des leads dans le pipeline" 
            icon={<ArrowDownUp className="h-5 w-5" />}
            className="h-[500px]"
          >
            <div className="h-full w-full pt-6">
              <SalesPerformanceChart 
                data={[
                  { name: 'Nouveaux', total: 180 },
                  { name: 'Contactés', total: 150 },
                  { name: 'Qualifiés', total: 120 },
                  { name: 'Visite', total: 80 },
                  { name: 'Offre', total: 40 },
                  { name: 'Gagnés', total: 25 }
                ]} 
                isConversionFunnel 
              />
            </div>
          </DashboardCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
