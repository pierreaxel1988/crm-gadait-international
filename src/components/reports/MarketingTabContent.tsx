
import React, { useState } from 'react';
import { DollarSign, TrendingUp, BarChart3, LineChart, Target } from 'lucide-react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import ConversionRateCard from '@/components/reports/ConversionRateCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MarketingROIChart from '@/components/reports/MarketingROIChart';
import MarketingChannelsTable from '@/components/reports/MarketingChannelsTable';
import { useIsMobile } from '@/hooks/use-mobile';

interface MarketingTabContentProps {
  period: string;
}

const MarketingTabContent: React.FC<MarketingTabContentProps> = ({ period }) => {
  const isMobile = useIsMobile();
  const [channelFilter, setChannelFilter] = useState<string>('all');
  
  // Données mockées pour le ROI marketing
  const roiData = [
    { name: 'Site Web', cost: 5000, leads: 35, sales: 3, revenue: 1200000 },
    { name: 'Portails', cost: 6500, leads: 48, sales: 5, revenue: 1850000 },
    { name: 'Réseaux sociaux', cost: 2800, leads: 22, sales: 2, revenue: 950000 },
    { name: 'Partenariats', cost: 3500, leads: 18, sales: 3, revenue: 2200000 },
    { name: 'Relations PR', cost: 1800, leads: 10, sales: 1, revenue: 1500000 },
  ];
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ConversionRateCard 
          title="Budget marketing" 
          value="€19.6K" 
          change={12} 
          period="vs période précédente"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <ConversionRateCard 
          title="Coût par lead" 
          value="€173" 
          change={-8} 
          period="vs période précédente"
          inverse
          icon={<Target className="h-5 w-5" />}
        />
        <ConversionRateCard 
          title="Coût acquisition" 
          value="€1.4K" 
          change={-12} 
          period="vs période précédente"
          inverse
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <ConversionRateCard 
          title="ROI Marketing" 
          value="384%" 
          change={34} 
          period="vs période précédente"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>
      
      <DashboardCard 
        title="Performance ROI par canal" 
        subtitle="Retour sur investissement par canal marketing"
        icon={<LineChart className="h-5 w-5" />}
        action={
          <Select 
            value={channelFilter} 
            onValueChange={setChannelFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tous les canaux" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les canaux</SelectItem>
              <SelectItem value="web">Site Web</SelectItem>
              <SelectItem value="portals">Portails</SelectItem>
              <SelectItem value="social">Réseaux sociaux</SelectItem>
              <SelectItem value="partners">Partenariats</SelectItem>
            </SelectContent>
          </Select>
        }
        className={`${isMobile ? 'h-[400px]' : 'h-[500px]'}`}
      >
        <div className="h-full w-full pt-4">
          <MarketingROIChart data={roiData} channelFilter={channelFilter} />
        </div>
      </DashboardCard>
      
      <DashboardCard 
        title="Analyse des canaux marketing" 
        subtitle="Performance détaillée par canal"
        icon={<BarChart3 className="h-5 w-5" />}
      >
        <div className="pt-4">
          <MarketingChannelsTable data={roiData} />
        </div>
      </DashboardCard>
    </div>
  );
};

export default MarketingTabContent;
