
import React from 'react';
import { ArrowDownUp } from 'lucide-react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import ConversionRateCard from '@/components/reports/ConversionRateCard';
import SalesPerformanceChart from '@/components/reports/SalesPerformanceChart';
import { useIsMobile } from '@/hooks/use-mobile';
import { Period } from './PeriodSelector';

interface ConversionTabContentProps {
  period?: Period;
}

const ConversionTabContent: React.FC<ConversionTabContentProps> = ({ period = 'month' }) => {
  const isMobile = useIsMobile();
  
  // Données du parcours de conversion avec valeurs précises
  const conversionData = React.useMemo(() => {
    // Dans une application réelle, ces données seraient chargées depuis une API
    // en fonction de la période sélectionnée
    return [
      { name: 'Nouveaux', total: 180, status: 'New' },
      { name: 'Contactés', total: 153, status: 'Contacted' },
      { name: 'Qualifiés', total: 120, status: 'Qualified' },
      { name: 'Propositions', total: 98, status: 'Proposal' },
      { name: 'Visites', total: 75, status: 'Visit' },
      { name: 'Offres', total: 52, status: 'Offer' },
      { name: 'Dépôt reçu', total: 38, status: 'Deposit' },
      { name: 'Signés', total: 25, status: 'Signed' }
    ];
  }, [period]);

  // Calcul des taux de conversion pour les cartes
  const visitRate = Math.round((75 / 180) * 100); // Taux de visite
  const offerRate = Math.round((52 / 75) * 100);  // Taux d'offre
  const signatureRate = Math.round((25 / 38) * 100); // Taux de signature

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ConversionRateCard 
          title="Taux de visite" 
          value={`${visitRate}%`} 
          change={4} 
          period="vs dernier mois"
        />
        <ConversionRateCard 
          title="Taux d'offre" 
          value={`${offerRate}%`} 
          change={7} 
          period="vs dernier mois"
        />
        <ConversionRateCard 
          title="Taux de signature" 
          value={`${signatureRate}%`} 
          change={-3} 
          period="vs dernier mois"
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
    </div>
  );
};

export default ConversionTabContent;
