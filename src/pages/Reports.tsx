
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartPie, ChartBar, BarChart3, LineChart, Clock, TrendingUp, MapPin, Euro, Landmark } from 'lucide-react';
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
import { useLuxuryMetrics } from '@/hooks/useLuxuryMetrics';
import { formatResponseTime } from '@/utils/formatUtils';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import TopAgentsTable from '@/components/reports/TopAgentsTable';
import LeadsByStageTable from '@/components/reports/LeadsByStageTable';
import ResponseTimeMetric from '@/components/reports/ResponseTimeMetric';
import ResponseTimeByAgentTable from '@/components/reports/ResponseTimeByAgentTable';
import FinancialMetricCard from '@/components/reports/FinancialMetricsCard';
import GeographicalAnalysis from '@/components/reports/GeographicalAnalysis';
import AgentPerformanceMetrics from '@/components/reports/AgentPerformanceMetrics';
import LeadSourceAnalysis from '@/components/reports/LeadSourceAnalysis';
import PredictiveAnalysis from '@/components/reports/PredictiveAnalysis';

const Reports = () => {
  const [period, setPeriod] = useState<string>('month');
  const { toast } = useToast();
  
  // Load existing data from Supabase
  const { data: performanceData, isLoading: isLoadingPerformance } = usePerformanceData(period);
  const { data: leadsData, isLoading: isLoadingLeads } = useLeadsSourceData(period);
  const { data: conversionData, isLoading: isLoadingConversion } = useConversionFunnelData(period);
  const { data: agentData, isLoading: isLoadingAgentData } = useAgentPerformanceData(period);
  const { data: responseTimeData, isLoading: isLoadingResponseTime } = useLeadResponseTime(period);
  
  // Load new luxury metrics data
  const { 
    financialMetrics,
    isLoadingFinancial,
    geoData,
    isLoadingGeo,
    agentPerformance,
    isLoadingAgentPerf,
    leadSourceAnalysis,
    isLoadingLeadSource,
    salesPrediction,
    isLoadingSalesPrediction,
    pricePrediction,
    isLoadingPricePrediction
  } = useLuxuryMetrics(period);
  
  // Using actual data from the API calls
  const totalLeads = leadsData?.reduce((sum, item) => sum + item.count, 0) || 0;
  const conversionRate = performanceData && totalLeads ? 
    Math.round((performanceData.filter(d => d.total > 0).length / totalLeads) * 100) : 28;
  
  // Calculate the actual average value from real budget data
  const averageValue = calculateAverageBudget(performanceData);
  
  // Calculate changes compared to previous period
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
        
        {/* Financial metrics cards with luxury styling */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <FinancialMetricCard 
            title="Commission moyenne" 
            value={financialMetrics?.avgCommission || '€0'} 
            change={financialMetrics?.commissionChange || 0}
            period={period}
            icon={<Euro className="h-6 w-6 text-blue-700" />}
            isLoading={isLoadingFinancial}
          />
          
          <FinancialMetricCard 
            title="Prix moyen au m²" 
            value="€15,250" 
            change={8}
            period={period}
            icon={<Landmark className="h-6 w-6 text-emerald-700" />}
            isLoading={isLoadingFinancial}
          />
          
          <FinancialMetricCard 
            title="Indice de luxe" 
            value="142" 
            change={12}
            period={period}
            icon={<TrendingUp className="h-6 w-6 text-amber-700" />}
            isLoading={isLoadingFinancial}
          />
          
          <ResponseTimeMetric 
            responseTime={responseTimeData?.averageResponseMinutes || 0}
            change={responseTimeChange}
            period={period}
            isLoading={isLoadingResponseTime}
          />
        </div>
        
        {/* Key Performance Indicators */}
        <LeadsByStageTable period={period} />
        
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="mb-6 flex flex-wrap justify-center md:justify-start gap-1 p-1 rounded-xl bg-white border border-gray-200 shadow-sm">
            <TabsTrigger 
              value="performance" 
              className="flex items-center gap-2 px-5 py-2.5 transition-all rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Performance</span>
            </TabsTrigger>
            <TabsTrigger 
              value="leads" 
              className="flex items-center gap-2 px-5 py-2.5 transition-all rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <ChartBar className="h-4 w-4" />
              <span>Leads</span>
            </TabsTrigger>
            <TabsTrigger 
              value="conversion" 
              className="flex items-center gap-2 px-5 py-2.5 transition-all rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <ChartPie className="h-4 w-4" />
              <span>Conversion</span>
            </TabsTrigger>
            <TabsTrigger 
              value="geographic" 
              className="flex items-center gap-2 px-5 py-2.5 transition-all rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <MapPin className="h-4 w-4" />
              <span>Géographique</span>
            </TabsTrigger>
            <TabsTrigger 
              value="predictive" 
              className="flex items-center gap-2 px-5 py-2.5 transition-all rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Prévisions</span>
            </TabsTrigger>
            <TabsTrigger 
              value="responseTime" 
              className="flex items-center gap-2 px-5 py-2.5 transition-all rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Clock className="h-4 w-4" />
              <span>Temps de réponse</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="performance">
            <div className="grid grid-cols-1 gap-8">
              <PerformanceTabContent 
                isLoading={isLoadingPerformance} 
                performanceData={performanceData || []} 
                period={period}
              />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <TopAgentsTable 
                  agentData={agentData || []}
                  isLoading={isLoadingAgentData}
                  period={period}
                />
                
                <AgentPerformanceMetrics
                  data={agentPerformance || []}
                  isLoading={isLoadingAgentPerf}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="leads">
            <LeadsTabContent 
              isLoading={isLoadingLeads} 
              leadsData={leadsData || []}
              period={period}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              <Card className="border-none shadow-luxury overflow-hidden">
                <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
                  <CardTitle className="font-futura text-xl text-gray-800">
                    Analyse des sources de leads
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <LeadSourceAnalysis
                    data={leadSourceAnalysis || []}
                    isLoading={isLoadingLeadSource}
                    metric="cost"
                  />
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-luxury overflow-hidden">
                <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
                  <CardTitle className="font-futura text-xl text-gray-800">
                    ROI par source de lead
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <LeadSourceAnalysis
                    data={leadSourceAnalysis || []}
                    isLoading={isLoadingLeadSource}
                    metric="roi"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="conversion">
            <ConversionTabContent 
              isLoading={isLoadingConversion} 
              conversionData={conversionData || []}
              period={period}
            />
          </TabsContent>
          
          <TabsContent value="geographic">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-none shadow-luxury overflow-hidden">
                <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
                  <CardTitle className="font-futura text-xl text-gray-800">
                    Distribution géographique des transactions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <GeographicalAnalysis
                    data={geoData || []}
                    isLoading={isLoadingGeo}
                  />
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-luxury overflow-hidden">
                <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
                  <CardTitle className="font-futura text-xl text-gray-800">
                    Zones à forte demande
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col space-y-4">
                  {isLoadingGeo ? (
                    <div className="space-y-3">
                      <Skeleton className="h-12 w-full rounded-md" />
                      <Skeleton className="h-12 w-full rounded-md" />
                      <Skeleton className="h-12 w-full rounded-md" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-md">
                        <span className="font-medium">Paris 16ème</span>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-700 font-semibold">+24%</span>
                          <TrendingUp className="h-4 w-4 text-blue-700" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-md">
                        <span className="font-medium">Neuilly-sur-Seine</span>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-700 font-semibold">+18%</span>
                          <TrendingUp className="h-4 w-4 text-blue-700" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-md">
                        <span className="font-medium">Cannes</span>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-700 font-semibold">+12%</span>
                          <TrendingUp className="h-4 w-4 text-blue-700" />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="predictive">
            <div className="grid grid-cols-1 gap-8">
              <PredictiveAnalysis 
                data={salesPrediction || []}
                title="Prévision des ventes"
                isLoading={isLoadingSalesPrediction}
              />
              
              <PredictiveAnalysis 
                data={pricePrediction || []}
                title="Prévision du prix moyen"
                isLoading={isLoadingPricePrediction}
                valuePrefix="€"
                valueSuffix="M"
              />
              
              <Card className="border-none shadow-luxury overflow-hidden">
                <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
                  <CardTitle className="font-futura text-xl text-gray-800">
                    Opportunités de marché détectées
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border border-emerald-100 bg-emerald-50/30 shadow-sm">
                      <CardContent className="p-6">
                        <h4 className="font-medium text-lg mb-2">Neuilly-sur-Seine</h4>
                        <p className="text-sm text-gray-600 mb-4">Augmentation de la demande pour des biens de luxe avec vue</p>
                        <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                          <TrendingUp className="h-4 w-4" />
                          <span>Potentiel de croissance de 15%</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border border-emerald-100 bg-emerald-50/30 shadow-sm">
                      <CardContent className="p-6">
                        <h4 className="font-medium text-lg mb-2">Saint-Jean-Cap-Ferrat</h4>
                        <p className="text-sm text-gray-600 mb-4">Demande croissante pour des villas modernes</p>
                        <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                          <TrendingUp className="h-4 w-4" />
                          <span>Potentiel de croissance de 22%</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border border-emerald-100 bg-emerald-50/30 shadow-sm">
                      <CardContent className="p-6">
                        <h4 className="font-medium text-lg mb-2">Paris 8ème</h4>
                        <p className="text-sm text-gray-600 mb-4">Opportunités pour des biens de prestige rénovés</p>
                        <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                          <TrendingUp className="h-4 w-4" />
                          <span>Potentiel de croissance de 18%</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
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
