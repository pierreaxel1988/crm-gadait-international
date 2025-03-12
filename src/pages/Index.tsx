import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import LeadStatCard from '@/components/dashboard/LeadStatCard';
import RecentActivityCard from '@/components/dashboard/RecentActivityCard';
import ImportedLeadsPanel from '@/components/leads/ImportedLeadsPanel';
import { useNavigate } from 'react-router-dom';
import { getLeads } from '@/services/leadService';

interface Activity {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target: string;
  timestamp: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    newLeads: 0,
    qualifiedLeads: 0,
    upcomingTasks: 0
  });
  
  useEffect(() => {
    const leads = getLeads();
    
    const newLeadsCount = leads.filter(lead => 
      lead.status === "New" && 
      new Date(lead.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    
    const qualifiedLeadsCount = leads.filter(lead => 
      lead.status === "Qualified"
    ).length;
    
    const upcomingTasksCount = leads.filter(lead => 
      lead.nextFollowUpDate && 
      new Date(lead.nextFollowUpDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
    ).length;
    
    setStats({
      newLeads: newLeadsCount,
      qualifiedLeads: qualifiedLeadsCount,
      upcomingTasks: upcomingTasksCount
    });
  }, []);
  
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-loro-navy">Tableau de bord</h1>
        <p className="text-loro-hazel">Bienvenue dans votre espace de gestion immobilière de luxe</p>
      </div>
      
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <DashboardCard title="Activité Récente">
          <RecentActivityCard activities={[
            {
              id: '1',
              user: { name: 'Marie Lambert' },
              action: 'a créé un nouveau lead',
              target: 'Lead',
              timestamp: '2023-06-17'
            },
            {
              id: '2',
              user: { name: 'Jean Dupont' },
              action: 'a planifié un appel avec',
              target: 'Client',
              timestamp: '2023-06-15'
            },
            {
              id: '3',
              user: { name: 'Claire Simon' },
              action: 'a organisé une visite pour',
              target: 'Propriété',
              timestamp: '2023-06-12'
            }
          ]} />
        </DashboardCard>
        
        <ImportedLeadsPanel limit={3} />
      </div>
    </div>
  );
};

export default Index;
