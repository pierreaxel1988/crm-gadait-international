
import React, { useState } from 'react';
import { Filter, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardCard from '@/components/dashboard/DashboardCard';
import ConversionRateCard from '@/components/reports/ConversionRateCard';
import LeadSourceDistribution from '@/components/reports/LeadSourceDistribution';
import LeadsPerAgentChart from '@/components/reports/LeadsPerAgentChart';

const LeadsTabContent: React.FC = () => {
  const [leadsPeriod, setLeadsPeriod] = useState<'semaine' | 'mois' | 'annee'>('mois');
  
  return (
    <div className="space-y-6">
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
        title="Leads par commercial" 
        subtitle="Nombre de leads par agent commercial"
        icon={<Users className="h-5 w-5" />}
        action={
          <Select value={leadsPeriod} onValueChange={(value) => setLeadsPeriod(value as 'semaine' | 'mois' | 'annee')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semaine">Par semaine</SelectItem>
              <SelectItem value="mois">Par mois</SelectItem>
              <SelectItem value="annee">Par année</SelectItem>
            </SelectContent>
          </Select>
        }
        className="h-[450px]"
      >
        <div className="h-[400px] w-full pt-4">
          <LeadsPerAgentChart period={leadsPeriod} />
        </div>
      </DashboardCard>
    </div>
  );
};

export default LeadsTabContent;
