
import React from 'react';
import { ArrowDownUp, Target, Clock, TrendingUp } from 'lucide-react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import ConversionRateCard from '@/components/reports/ConversionRateCard';
import SalesPerformanceChart from '@/components/reports/SalesPerformanceChart';
import LeadSourceDistribution from '@/components/reports/LeadSourceDistribution';
import { useIsMobile } from '@/hooks/use-mobile';

interface ConversionTabContentProps {
  period: string;
}

const ConversionTabContent: React.FC<ConversionTabContentProps> = ({ period }) => {
  const isMobile = useIsMobile();
  
  // Données du parcours de conversion avec les nouvelles étapes
  const conversionData = [
    { name: 'Nouveaux', total: 180 },
    { name: 'Contactés', total: 150 },
    { name: 'Qualifiés', total: 120 },
    { name: 'Propositions', total: 100 },
    { name: 'Visites en cours', total: 80 },
    { name: 'Offre en cours', total: 60 },
    { name: 'Dépôt reçu', total: 40 },
    { name: 'Signature finale', total: 30 },
    { name: 'Conclus', total: 25 }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ConversionRateCard 
          title="Taux global" 
          value="14.8%" 
          change={2.5} 
          period="vs période précédente"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <ConversionRateCard 
          title="Taux de visite" 
          value="38%" 
          change={15} 
          period="vs période précédente"
          icon={<Target className="h-5 w-5" />}
        />
        <ConversionRateCard 
          title="Taux d'offre" 
          value="18%" 
          change={-2} 
          period="vs période précédente"
          icon={<ArrowDownUp className="h-5 w-5" />}
        />
        <ConversionRateCard 
          title="Temps moyen" 
          value="72 jours" 
          change={-5} 
          period="vs période précédente"
          inverse
          icon={<Clock className="h-5 w-5" />}
        />
      </div>
      
      <DashboardCard 
        title="Parcours de conversion" 
        subtitle="Évolution du statut des leads dans le pipeline" 
        icon={<ArrowDownUp className="h-5 w-5" />}
        className={isMobile ? "h-[750px]" : "h-[500px]"}
      >
        <div className={`h-full w-full ${isMobile ? "pt-2" : "pt-6"}`}>
          <SalesPerformanceChart 
            data={conversionData} 
            isConversionFunnel={true} 
          />
        </div>
      </DashboardCard>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard 
          title="Distribution des sources de leads" 
          subtitle="Répartition par canal d'acquisition" 
          icon={<ArrowDownUp className="h-5 w-5" />}
          className="h-[400px]"
        >
          <div className="h-full w-full pt-4">
            <LeadSourceDistribution isLeadSources={true} />
          </div>
        </DashboardCard>
        
        <DashboardCard 
          title="Distribution par plage de budget" 
          subtitle="Répartition des leads par budget recherché" 
          icon={<ArrowDownUp className="h-5 w-5" />}
          className="h-[400px]"
        >
          <div className="h-full w-full pt-4">
            <LeadSourceDistribution isBudgetDistribution={true} />
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default ConversionTabContent;
