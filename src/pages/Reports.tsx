import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartPie, ChartBar, BarChart3, LineChart, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ReportsHeader from '@/components/reports/ReportsHeader';
import PerformanceTabContent from '@/components/reports/PerformanceTabContent';
import LeadsTabContent from '@/components/reports/LeadsTabContent';
import ConversionTabContent from '@/components/reports/ConversionTabContent';
import { useToast } from "@/components/ui/use-toast";
import { 
  usePerformanceData, 
  useLeadsSourceData, 
  useConversionFunnelData, 
  useAgentPerformanceData 
} from '@/hooks/useReportsData';
import { useLeadResponseTime } from '@/hooks/useLeadResponseTime';
import { formatResponseTime } from '@/utils/formatUtils';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import TopAgentsTable from '@/components/reports/TopAgentsTable';
import LeadsByStageTable from '@/components/reports/LeadsByStageTable';
import ResponseTimeMetric from '@/components/reports/ResponseTimeMetric';
import ResponseTimeByAgentTable from '@/components/reports/ResponseTimeByAgentTable';

const Reports = () => {
  const [period, setPeriod] = useState<string>('month');
  const { toast } = useToast();
  
  // Charger les données réelles depuis Supabase
  const { data: performanceData, isLoading: isLoadingPerformance } = usePerformanceData(period);
  const { data: leadsData, isLoading: isLoadingLeads } = useLeadsSourceData(period);
  const { data: conversionData, isLoading: isLoadingConversion } = useConversionFunnelData(period);
  const { data: agentData, isLoading: isLoadingAgentData } = useAgentPerformanceData(period);
  const { data: responseTimeData, isLoading: isLoadingResponseTime } = useLeadResponseTime(period);

  // Calculer les métriques pour les cartes en haut de la page
  // Using actual data from the API calls
  const totalLeads = leadsData?.reduce((sum, item) => sum + item.count, 0) || 0;
  const conversionRate = performanceData && totalLeads ? 
    Math.round((performanceData.filter(d => d.total > 0).length / totalLeads) * 100) : 28;
  
  // Calculate the actual average value from real budget data
  const averageValue = calculateAverageBudget(performanceData);
  
  // Calcul de l'évolution par rapport au mois précédent (simulation)
  const leadsChange = 12;
  const conversionChange = 5;
  const valueChange = 8;
  const responseTimeChange = -7; // Negative means improvement (faster response)
  
  const handleExport = () => {
    toast({
      title: "Export initié",
      description: "Votre rapport sera téléchargé dans quelques instants",
      duration: 3000
    });
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-gray-50">
      <Navbar />
      <SubNavigation />
      
      <div className="p-4 lg:p-8 space-y-8 max-w-[1920px] mx-auto">
        <ReportsHeader period={period} setPeriod={setPeriod} onExport={handleExport} />
        
        {/* Refined cards with luxury styling */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="overflow-hidden border-none shadow-luxury transition-all duration-300 hover:shadow-luxury-hover">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-1">
              <CardContent className="pt-6 pb-6 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider font-futura">Leads totaux</p>
                    <h3 className="text-3xl font-bold mt-1 font-futura text-gray-900">{totalLeads}</h3>
                    <div className="flex items-center mt-2">
                      <span className={`inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded ${leadsChange > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
                        {leadsChange > 0 ? '+' : ''}{leadsChange}%
                      </span>
                      <span className="ml-1.5 text-xs text-gray-500">depuis le dernier {period}</span>
                    </div>
                  </div>
                  <div className="bg-blue-100 p-2.5 rounded-full">
                    <ChartBar className="h-6 w-6 text-blue-700" />
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
          
          <Card className="overflow-hidden border-none shadow-luxury transition-all duration-300 hover:shadow-luxury-hover">
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-1">
              <CardContent className="pt-6 pb-6 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider font-futura">Taux de conversion</p>
                    <h3 className="text-3xl font-bold mt-1 font-futura text-gray-900">{conversionRate}%</h3>
                    <div className="flex items-center mt-2">
                      <span className={`inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded ${conversionChange > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
                        {conversionChange > 0 ? '+' : ''}{conversionChange}%
                      </span>
                      <span className="ml-1.5 text-xs text-gray-500">depuis le dernier {period}</span>
                    </div>
                  </div>
                  <div className="bg-emerald-100 p-2.5 rounded-full">
                    <ChartPie className="h-6 w-6 text-emerald-700" />
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
          
          <Card className="overflow-hidden border-none shadow-luxury transition-all duration-300 hover:shadow-luxury-hover">
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-1">
              <CardContent className="pt-6 pb-6 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider font-futura">Valeur moyenne</p>
                    <h3 className="text-3xl font-bold mt-1 font-futura text-gray-900">{averageValue}</h3>
                    <div className="flex items-center mt-2">
                      <span className={`inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded ${valueChange > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
                        {valueChange > 0 ? '+' : ''}{valueChange}%
                      </span>
                      <span className="ml-1.5 text-xs text-gray-500">depuis le dernier {period}</span>
                    </div>
                  </div>
                  <div className="bg-amber-100 p-2.5 rounded-full">
                    <LineChart className="h-6 w-6 text-amber-700" />
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
          
          <ResponseTimeMetric 
            responseTime={responseTimeData?.averageResponseMinutes || 0}
            change={responseTimeChange}
            period={period}
            isLoading={isLoadingResponseTime}
          />
        </div>
        
        {/* Nouveau tableau de leads par commercial et stade */}
        <LeadsByStageTable period={period} />
        
        {/* Tableau de temps de réponse par agent */}
        <ResponseTimeByAgentTable 
          data={responseTimeData?.byAgent || []}
          isLoading={isLoadingResponseTime}
        />
        
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="mb-6 grid grid-cols-3 md:flex md:flex-wrap w-full md:w-auto bg-gray-100/50 p-1 rounded-lg">
            <TabsTrigger 
              value="performance" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Performance</span>
            </TabsTrigger>
            <TabsTrigger 
              value="leads" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <ChartBar className="h-4 w-4" />
              <span>Leads</span>
            </TabsTrigger>
            <TabsTrigger 
              value="conversion" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <ChartPie className="h-4 w-4" />
              <span>Conversion</span>
            </TabsTrigger>
            <TabsTrigger 
              value="responseTime" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Clock className="h-4 w-4" />
              <span>Temps de réponse</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="performance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PerformanceTabContent 
                isLoading={isLoadingPerformance} 
                performanceData={performanceData || []} 
                period={period}
              />
              <TopAgentsTable 
                agentData={agentData || []}
                isLoading={isLoadingAgentData}
                period={period}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="leads">
            <LeadsTabContent 
              isLoading={isLoadingLeads} 
              leadsData={leadsData || []}
              period={period}
            />
          </TabsContent>
          
          <TabsContent value="conversion">
            <ConversionTabContent 
              isLoading={isLoadingConversion} 
              conversionData={conversionData || []}
              period={period}
            />
          </TabsContent>
          
          <TabsContent value="responseTime">
            <div className="grid grid-cols-1 gap-6 h-full min-h-[calc(100vh-250px)]">
              <Card className="border-none shadow-luxury overflow-hidden">
                <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
                  <CardTitle className="font-futura text-xl text-gray-800">
                    Analyse détaillée des temps de réponse
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-medium text-gray-800 mb-2">Temps moyen de réponse</h3>
                        <p className="text-3xl font-bold text-indigo-600">
                          {isLoadingResponseTime ? 
                            <Skeleton className="h-8 w-24" /> : 
                            formatResponseTime(responseTimeData?.averageResponseMinutes || 0)
                          }
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Basé sur {responseTimeData?.countedLeads || 0} leads
                        </p>
                      </div>
                      
                      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-medium text-gray-800 mb-2">Commercial le plus rapide</h3>
                        {isLoadingResponseTime || !responseTimeData?.byAgent?.length ? (
                          <div className="space-y-2">
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        ) : (
                          <>
                            <p className="text-xl font-bold text-emerald-600">
                              {responseTimeData.byAgent[0]?.name || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatResponseTime(responseTimeData.byAgent[0]?.avgResponseTime || 0)}
                            </p>
                          </>
                        )}
                      </div>
                      
                      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-medium text-gray-800 mb-2">Impact sur les ventes</h3>
                        <p className="text-xl font-bold text-blue-600">+24%</p>
                        <p className="text-sm text-gray-500 mt-1">
                          de chance de conversion si réponse &lt; 1h
                        </p>
                      </div>
                    </div>
                    
                    <ResponseTimeByAgentTable 
                      data={responseTimeData?.byAgent || []}
                      isLoading={isLoadingResponseTime}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Function to calculate the real average budget from lead data
const calculateAverageBudget = (performanceData: any[]): string => {
  if (!performanceData?.length) return '€0';
  
  // Extract budget values and calculate total
  let totalValue = 0;
  let validBudgetCount = 0;
  
  performanceData.forEach(item => {
    if (typeof item.total === 'number' && item.total > 0) {
      totalValue += item.total;
      validBudgetCount++;
    }
  });
  
  // Avoid division by zero
  if (validBudgetCount === 0) return '€0';
  
  const average = totalValue / validBudgetCount;
  
  // Format the average value
  if (average >= 1000000) {
    return `€${(average / 1000000).toFixed(1)}M`;
  } else if (average >= 1000) {
    return `€${(average / 1000).toFixed(0)}K`;
  } else {
    return `€${average.toFixed(0)}`;
  }
};

export default Reports;
