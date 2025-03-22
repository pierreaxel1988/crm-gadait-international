
import React from 'react';
import StatsSection from '@/components/dashboard/StatsSection';
import ActivitySection from '@/components/dashboard/ActivitySection';
import ImportedLeadsSection from '@/components/dashboard/ImportedLeadsSection';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, isAdmin } = useAuth();
  
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-futura text-loro-navy">Tableau de bord</h1>
        <p className="text-chocolate-dark font-futuraLight">
          Bienvenue dans votre espace de gestion immobilière de luxe
          {isAdmin && " (Accès Administrateur)"}
        </p>
      </div>
      
      <StatsSection />
      
      <ActivitySection />

      {user && <ImportedLeadsSection />}
    </div>
  );
};

export default Index;
