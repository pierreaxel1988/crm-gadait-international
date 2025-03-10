
import React from 'react';
import { ArrowDownUp } from 'lucide-react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import ConversionRateCard from '@/components/reports/ConversionRateCard';
import SalesPerformanceChart from '@/components/reports/SalesPerformanceChart';
import { useIsMobile } from '@/hooks/use-mobile';

const ConversionTabContent: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
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
        className={isMobile ? "h-[600px]" : "h-[500px]"}
      >
        <div className={`h-full w-full ${isMobile ? "pt-2" : "pt-6"}`}>
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
    </div>
  );
};

export default ConversionTabContent;
