
import React from 'react';
import StatsSection from '@/components/dashboard/StatsSection';
import ActivitySection from '@/components/dashboard/ActivitySection';

const Index = () => {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-loro-navy">Tableau de bord</h1>
        <p className="text-loro-hazel">Bienvenue dans votre espace de gestion immobilière de luxe</p>
      </div>
      
      <StatsSection />
      
      <ActivitySection />
    </div>
  );
};

export default Index;
