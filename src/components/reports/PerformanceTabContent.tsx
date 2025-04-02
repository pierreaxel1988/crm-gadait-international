
import React from 'react';
import { BarChart3, PieChart } from 'lucide-react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import ConversionRateCard from '@/components/reports/ConversionRateCard';
import SalesPerformanceChart from '@/components/reports/SalesPerformanceChart';
import LeadSourceDistribution from '@/components/reports/LeadSourceDistribution';
import TopAgentsTable from '@/components/reports/TopAgentsTable';

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

const PerformanceTabContent: React.FC = () => {
  return (
    <div className="space-y-6">
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
    </div>
  );
};

export default PerformanceTabContent;
