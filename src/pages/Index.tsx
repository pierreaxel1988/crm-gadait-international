
import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import LeadStatCard from '@/components/dashboard/LeadStatCard';
import RecentActivityCard from '@/components/dashboard/RecentActivityCard';
import ImportedLeadsPanel from '@/components/leads/ImportedLeadsPanel';
import LeadApiGuide from '@/components/leads/LeadApiGuide';
import { useNavigate } from 'react-router-dom';
import CustomButton from '@/components/ui/CustomButton';
import { getLeads } from '@/services/leadService';

const Index = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    newLeads: 0,
    qualifiedLeads: 0,
    upcomingTasks: 0
  });
  
  useEffect(() => {
    // Calcul des statistiques à partir des leads
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
          trend={+8} 
          period="cette semaine" 
          onClick={() => navigate('/leads')}
        />
        <LeadStatCard 
          title="Leads Qualifiés" 
          value={stats.qualifiedLeads}
          trend={+5} 
          period="ce mois" 
          onClick={() => navigate('/leads')}
        />
        <LeadStatCard 
          title="Tâches à venir" 
          value={stats.upcomingTasks}
          trend={-2} 
          period="aujourd'hui" 
          onClick={() => navigate('/calendar')}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <DashboardCard title="Activité Récente">
          <RecentActivityCard activities={[
            { id: '1', type: 'Nouveau lead', name: 'Marie Lambert', date: '2023-06-17', status: 'New' },
            { id: '2', type: 'Appel', name: 'Jean Dupont', date: '2023-06-15', status: 'Contacted' },
            { id: '3', type: 'Visite', name: 'Claire Simon', date: '2023-06-12', status: 'Visit' }
          ]} />
        </DashboardCard>
        
        <ImportedLeadsPanel limit={3} />
      </div>
      
      <div className="flex justify-between items-center mt-8">
        <h2 className="text-xl font-semibold">API d'importation de Leads</h2>
        <CustomButton 
          variant="outline" 
          className="flex items-center gap-1.5 border-chocolate-light text-chocolate-dark hover:bg-chocolate-light/10"
          onClick={() => {
            // Naviguer vers une page dédiée si elle existe
            // ou simplement afficher plus d'informations
          }}
        >
          Voir la documentation <ArrowRight className="h-4 w-4" />
        </CustomButton>
      </div>
      
      <LeadApiGuide />
    </div>
  );
};

export default Index;
