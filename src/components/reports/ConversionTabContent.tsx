import React from 'react';
import { Period } from '@/components/reports/PeriodSelector';
import { Grid } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SalesPerformanceChart from './SalesPerformanceChart';
import ConversionFunnelChart from './ConversionFunnelChart';
import ConversionRateCard from './ConversionRateCard';
import LeadSourceDistribution from './LeadSourceDistribution';

interface ConversionTabContentProps {
  period: Period;
}

const ConversionTabContent: React.FC<ConversionTabContentProps> = ({ period }) => {
  const conversionFunnelData = [
    { name: 'Nouveaux leads', total: 1240 },
    { name: 'Contactés', total: 980 },
    { name: 'Qualifiés', total: 620 },
    { name: 'Visites', total: 410 },
    { name: 'Offres', total: 180 },
    { name: 'Réservations', total: 85 },
    { name: 'Ventes', total: 62 },
  ];

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ConversionRateCard 
          title="Taux de conversion" 
          value="5.2%" 
          change={0.8} 
          period="vs dernier mois"
        />
        <ConversionRateCard 
          title="Délai moyen de conversion" 
          value="42j" 
          change={-5} 
          period="vs dernier mois"
          inverse
        />
        <ConversionRateCard 
          title="Valeur moyenne" 
          value="€485k" 
          change={12} 
          period="vs dernier mois"
        />
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Entonnoir de conversion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <SalesPerformanceChart data={conversionFunnelData} isConversionFunnel />
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Conversion par source</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="rate" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="rate">Taux</TabsTrigger>
                <TabsTrigger value="volume">Volume</TabsTrigger>
              </TabsList>
              <TabsContent value="rate" className="h-[300px]">
                <LeadSourceDistribution isConversionRate />
              </TabsContent>
              <TabsContent value="volume" className="h-[300px]">
                <LeadSourceDistribution />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Conversion par étape</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ConversionFunnelChart />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConversionTabContent;
