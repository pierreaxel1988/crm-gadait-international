
import React from 'react';
import { useNavigate } from 'react-router-dom';
import LeadStatCard from '@/components/dashboard/LeadStatCard';

interface DashboardStatsProps {
  stats: {
    newLeads: number;
    qualifiedLeads: number;
    upcomingTasks: number;
  };
}

const DashboardStats = ({ stats }: DashboardStatsProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      <LeadStatCard 
        title="Nouveaux Leads" 
        value={stats.newLeads} 
        change={8} 
        onClick={() => navigate('/leads')}
      />
      <LeadStatCard 
        title="Leads Qualifiés" 
        value={stats.qualifiedLeads}
        change={5} 
        onClick={() => navigate('/leads')}
      />
      <LeadStatCard 
        title="Tâches à venir" 
        value={stats.upcomingTasks}
        change={-2} 
        onClick={() => navigate('/calendar')}
      />
    </div>
  );
};

export default DashboardStats;
