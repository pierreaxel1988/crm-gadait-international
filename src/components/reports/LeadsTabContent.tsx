import React, { useState } from 'react';
import { Filter, Users, BarChart, Table as TableIcon, PieChart } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import DashboardCard from '@/components/dashboard/DashboardCard';
import ConversionRateCard from '@/components/reports/ConversionRateCard';
import LeadSourceDistribution from '@/components/reports/LeadSourceDistribution';
import LeadsPerAgentChart from '@/components/reports/LeadsPerAgentChart';
import LeadsAgentsTable from '@/components/reports/LeadsAgentsTable';
import LeadsByPortalChart from '@/components/reports/LeadsByPortalChart';
import { Period, PeriodObject } from '@/components/reports/PeriodSelector';

const LeadsTabContent: React.FC = () => {
  const [leadsPeriod, setLeadsPeriod] = useState<'semaine' | 'mois' | 'annee'>('mois');
  const [displayMode, setDisplayMode] = useState<'chart' | 'table'>('chart');
  const [period, setPeriod] = useState<PeriodObject>({ type: 'mois' });
  
  return (
    <div className="grid grid-cols-1 gap-6 h-full min-h-[calc(100vh-250px)]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ConversionRateCard 
          title="Nouveaux leads" 
          value={124} 
          change={8} 
          period="vs dernier mois"
        />
        <ConversionRateCard 
          title="Taux de qualification" 
          value="62%" 
          change={4} 
          period="vs dernier mois"
        />
        <ConversionRateCard 
          title="Coût par lead" 
          value="€45" 
          change={-12} 
          period="vs dernier mois"
          inverse
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard 
          title="Origine des leads" 
          subtitle="Distribution par source d'acquisition" 
          icon={<Filter className="h-5 w-5" />}
        >
          <div className="h-[400px] flex items-center justify-center">
            <LeadSourceDistribution isLeadSources />
          </div>
        </DashboardCard>
        
        <DashboardCard 
          title="Leads par portail immobilier" 
          subtitle="Distribution des leads par portail" 
          icon={<PieChart className="h-5 w-5" />}
        >
          <div className="h-[400px] flex items-center justify-center">
            <LeadsByPortalChart period={period.type === 'mois' ? 'month' : 
                              period.type === 'semaine' ? 'week' : 
                              period.type === 'annee' ? 'year' : 'month'} />
          </div>
        </DashboardCard>
      </div>
      
      <DashboardCard 
        title="Leads par commercial" 
        subtitle="Nombre de leads par agent commercial"
        icon={<Users className="h-5 w-5" />}
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
            <LeadsPerAgentChart period={leadsPeriod} />
          ) : (
            <LeadsAgentsTable period={leadsPeriod} />
          )}
        </div>
      </DashboardCard>
    </div>
  );
};

export default LeadsTabContent;
