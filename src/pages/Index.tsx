import React from 'react';
import StatsSection from '@/components/dashboard/StatsSection';
import ActivitySection from '@/components/dashboard/ActivitySection';
import ImportedLeadsSection from '@/components/dashboard/ImportedLeadsSection';
import { useAuth } from '@/hooks/useAuth';
const Index = () => {
  const {
    user
  } = useAuth();
  return <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-loro-navy">Tableau de bord</h1>
        <p className="text-zinc-800">Bienvenue dans votre espace de gestion immobilière de luxe</p>
      </div>
      
      <StatsSection />
      
      <ActivitySection />

      {user && <ImportedLeadsSection />}
    </div>;
};
export default Index;