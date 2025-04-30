
import React, { useState } from 'react';
import { Filter, Users, BarChart, Table as TableIcon, PieChart } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import DashboardCard from '@/components/dashboard/DashboardCard';
import ConversionRateCard from '@/components/reports/ConversionRateCard';
import LeadSourceDistribution from '@/components/reports/LeadSourceDistribution';
import LeadsPerAgentChart from '@/components/reports/LeadsPerAgentChart';
import TopAgentsTable from '@/components/reports/TopAgentsTable';
import LeadsByPortalChart from '@/components/reports/LeadsByPortalChart';
import { Period } from '@/components/reports/PeriodSelector';
import { useLeadsAgentData, usePortalLeadsData } from '@/hooks/useReportsData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LeadsTabContentProps {
  leadsData: { name: string; value: number; count: number }[];
  isLoading: boolean;
  period: string;
}

const LeadsTabContent: React.FC<LeadsTabContentProps> = ({ 
  leadsData, 
  isLoading,
  period 
}) => {
  const [leadsPeriod, setLeadsPeriod] = useState<'semaine' | 'mois' | 'annee'>('mois');
  const [displayMode, setDisplayMode] = useState<'chart' | 'table'>('chart');
  const [periodState, setPeriodState] = useState<Period>({ type: 'mois' });

  // Récupérer les données de leads par agent
  const { data: leadsAgentData, isLoading: isLoadingAgents } = useLeadsAgentData(leadsPeriod);
  
  // Récupérer les données de leads par portail
  const { data: portalData, isLoading: isLoadingPortals } = usePortalLeadsData(period);
  
  // Fetch lead metrics
  const { data: leadMetrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['lead-metrics', period],
    queryFn: async () => {
      // Define the time period
      const now = new Date();
      let startDate = new Date();
      let previousStartDate = new Date();
      
      if (period === 'week') {
        startDate.setDate(now.getDate() - 7);
        previousStartDate.setDate(now.getDate() - 14);
      } else if (period === 'month') {
        startDate.setMonth(now.getMonth() - 1);
        previousStartDate.setMonth(now.getMonth() - 2);
      } else if (period === 'quarter') {
        startDate.setMonth(now.getMonth() - 3);
        previousStartDate.setMonth(now.getMonth() - 6);
      } else if (period === 'year') {
        startDate.setFullYear(now.getFullYear() - 1);
        previousStartDate.setFullYear(now.getFullYear() - 2);
      }
      
      // Current period leads count
      const { count: currentLeadsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());
      
      // Previous period leads count
      const { count: previousLeadsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString());
      
      // Calculate change
      const leadsChange = previousLeadsCount ? 
        Math.round(((currentLeadsCount - previousLeadsCount) / previousLeadsCount) * 100) : 0;
      
      // Calculate qualification rate (leads that moved past the "Nouveau" status)
      const { count: qualifiedLeadsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString())
        .not('status', 'eq', 'Nouveau');
      
      const qualificationRate = currentLeadsCount ?
        Math.round((qualifiedLeadsCount / currentLeadsCount) * 100) : 0;
      
      // Calculate previous qualification rate
      const { count: previousQualifiedLeadsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString())
        .not('status', 'eq', 'Nouveau');
      
      const previousQualificationRate = previousLeadsCount ?
        Math.round((previousQualifiedLeadsCount / previousLeadsCount) * 100) : 0;
      
      const qualificationChange = previousQualificationRate ?
        qualificationRate - previousQualificationRate : 0;
      
      return {
        totalLeads: currentLeadsCount || 0,
        leadsChange,
        qualificationRate: qualificationRate || 0,
        qualificationChange,
        costPerLead: 45, // This is an example value, could be calculated from actual marketing spend
        costChange: -12 // This is an example value
      };
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  
  return (
    <div className="grid grid-cols-1 gap-6 h-full min-h-[calc(100vh-250px)]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ConversionRateCard 
          title="Nouveaux leads" 
          value={leadMetrics?.totalLeads || 0} 
          change={leadMetrics?.leadsChange || 0} 
          period="vs dernier mois"
          isLoading={isLoadingMetrics}
        />
        <ConversionRateCard 
          title="Taux de qualification" 
          value={`${leadMetrics?.qualificationRate || 0}%`} 
          change={leadMetrics?.qualificationChange || 0} 
          period="vs dernier mois"
          isLoading={isLoadingMetrics}
        />
        <ConversionRateCard 
          title="Coût par lead" 
          value="€45" 
          change={-12} 
          period="vs dernier mois"
          inverse
          isLoading={isLoadingMetrics}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard 
          title="Origine des leads" 
          subtitle="Distribution par source d'acquisition" 
          icon={<Filter className="h-5 w-5" />}
          isLoading={isLoading}
        >
          <div className="h-[400px] flex items-center justify-center">
            <LeadSourceDistribution isLeadSources data={leadsData} />
          </div>
        </DashboardCard>
        
        <DashboardCard 
          title="Leads par portail immobilier" 
          subtitle="Distribution des leads par portail" 
          icon={<PieChart className="h-5 w-5" />}
          isLoading={isLoadingPortals}
        >
          <div className="h-[400px] flex items-center justify-center">
            <LeadsByPortalChart data={portalData || []} />
          </div>
        </DashboardCard>
      </div>
      
      <DashboardCard 
        title="Leads par commercial" 
        subtitle="Nombre de leads par agent commercial"
        icon={<Users className="h-5 w-5" />}
        isLoading={isLoadingAgents}
        action={
          <div className="flex items-center space-x-3">
            <ToggleGroup 
              type="single" 
              value={displayMode} 
              onValueChange={(value) => value && setDisplayMode(value as 'chart' | 'table')}
              className="border border-gray-200 rounded-md bg-gray-50"
            >
              <ToggleGroupItem 
                value="chart" 
                aria-label="Afficher en graphique" 
                className="data-[state=on]:bg-blue-600 data-[state=on]:text-white h-9 px-3"
              >
                <BarChart className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="table" 
                aria-label="Afficher en tableau" 
                className="data-[state=on]:bg-blue-600 data-[state=on]:text-white h-9 px-3"
              >
                <TableIcon className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <Select 
              value={leadsPeriod} 
              onValueChange={(value) => setLeadsPeriod(value as 'semaine' | 'mois' | 'annee')}
            >
              <SelectTrigger className="w-[150px] border-gray-200 focus:ring-blue-200">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semaine">Par semaine</SelectItem>
                <SelectItem value="mois">Par mois</SelectItem>
                <SelectItem value="annee">Par année</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        className="flex-1 flex flex-col"
      >
        <div className="flex-1 w-full h-full min-h-[500px]">
          {displayMode === 'chart' ? (
            <LeadsPerAgentChart 
              period={leadsPeriod} 
              data={leadsAgentData || []} 
              isLoading={isLoadingAgents} 
            />
          ) : (
            <TopAgentsTable 
              agentData={leadsAgentData?.map(agent => ({
                ...agent,
                leads: agent[leadsPeriod] || agent.leads || 0,
                sales: 0,
                value: "€0",
                conversion: 0
              }))} 
              isLoading={isLoadingAgents} 
              period={leadsPeriod} 
              simplified={true}
            />
          )}
        </div>
      </DashboardCard>
    </div>
  );
};

export default LeadsTabContent;
