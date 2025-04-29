
import React from 'react';
import { ArrowDownUp } from 'lucide-react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import ConversionRateCard from '@/components/reports/ConversionRateCard';
import SalesPerformanceChart from '@/components/reports/SalesPerformanceChart';
import LeadSourceDistribution from '@/components/reports/LeadSourceDistribution';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLeadsSourceData } from '@/hooks/useReportsData';

interface ConversionTabContentProps {
  conversionData: { name: string; total: number }[];
  isLoading: boolean;
  period: string;
}

const ConversionTabContent: React.FC<ConversionTabContentProps> = ({
  conversionData,
  isLoading,
  period
}) => {
  const isMobile = useIsMobile();
  
  // Récupérer les données des sources de leads pour la distribution
  const { data: leadsSourceData, isLoading: isLoadingLeadSources } = useLeadsSourceData(period);
  
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
        className={isMobile ? "h-[750px]" : "h-[500px]"}
        isLoading={isLoading}
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
          isLoading={isLoadingLeadSources}
        >
          <div className="h-full w-full pt-4">
            <LeadSourceDistribution isLeadSources={true} data={leadsSourceData || []} />
          </div>
        </DashboardCard>
        
        <DashboardCard 
          title="Distribution des types de biens" 
          subtitle="Répartition par type de propriété recherchée" 
          icon={<ArrowDownUp className="h-5 w-5" />}
          className="h-[400px]"
        >
          <div className="h-full w-full pt-4">
            <LeadSourceDistribution />
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default ConversionTabContent;
