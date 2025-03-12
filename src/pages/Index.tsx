import React from 'react';
import { ArrowRight } from 'lucide-react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import LeadStatCard from '@/components/dashboard/LeadStatCard';
import RecentActivityCard from '@/components/dashboard/RecentActivityCard';
import ImportedLeadsPanel from '@/components/leads/ImportedLeadsPanel';
import LeadApiGuide from '@/components/leads/LeadApiGuide';
import { useNavigate } from 'react-router-dom';
import CustomButton from '@/components/ui/CustomButton';

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-loro-navy">Tableau de bord</h1>
        <p className="text-loro-hazel">Bienvenue dans votre espace de gestion immobilière de luxe</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <LeadStatCard 
          title="Nouveaux Leads" 
          count={12} 
          trend={+8} 
          period="cette semaine" 
          onClick={() => navigate('/leads')}
        />
        <LeadStatCard 
          title="Leads Qualifiés" 
          count={34} 
          trend={+5} 
          period="ce mois" 
          onClick={() => navigate('/leads')}
        />
        <LeadStatCard 
          title="Tâches à venir" 
          count={8} 
          trend={-2} 
          period="aujourd'hui" 
          onClick={() => navigate('/calendar')}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <DashboardCard title="Activité Récente">
          <RecentActivityCard />
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
