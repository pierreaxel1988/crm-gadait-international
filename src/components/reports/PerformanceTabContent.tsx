
import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Calendar, Euro } from 'lucide-react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import ConversionRateCard from '@/components/reports/ConversionRateCard';
import SalesPerformanceChart from '@/components/reports/SalesPerformanceChart';
import LeadSourceDistribution from '@/components/reports/LeadSourceDistribution';
import TopAgentsTable from '@/components/reports/TopAgentsTable';
import { useIsMobile } from '@/hooks/use-mobile';

interface PerformanceTabContentProps {
  period: string;
}

// Données mockées pour le graphique des ventes
const salesData = [
  { name: 'Jan', total: 1250000 },
  { name: 'Feb', total: 2420000 },
  { name: 'Mar', total: 1980000 },
  { name: 'Apr', total: 2520000 },
  { name: 'May', total: 1950000 },
  { name: 'Jun', total: 3620000 },
  { name: 'Jul', total: 4780000 },
];

const PerformanceTabContent: React.FC<PerformanceTabContentProps> = ({ period }) => {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ConversionRateCard 
          title="Valeur moyenne" 
          value="€2.4M" 
          change={8} 
          period="vs période précédente"
          icon={<Euro className="h-5 w-5" />}
        />
        <ConversionRateCard 
          title="Prix moyen/m²" 
          value="€12,500" 
          change={3} 
          period="vs période précédente"
          icon={<Euro className="h-5 w-5" />}
        />
        <ConversionRateCard 
          title="Temps de vente" 
          value="45 jours" 
          change={-8} 
          period="vs période précédente"
          inverse
          icon={<Calendar className="h-5 w-5" />}
        />
        <ConversionRateCard 
          title="Croissance" 
          value="12.5%" 
          change={5} 
          period="vs période précédente"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>
      
      <DashboardCard 
        title="Performance des ventes" 
        subtitle="Montant total des ventes (en millions €)" 
        icon={<BarChart3 className="h-5 w-5" />}
        className={`${isMobile ? 'h-[400px]' : 'h-[500px]'}`}
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
