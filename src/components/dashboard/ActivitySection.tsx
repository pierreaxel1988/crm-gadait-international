
import React from 'react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import RecentActivityCard from '@/components/dashboard/RecentActivityCard';
import ImportedLeadsPanel from '@/components/leads/ImportedLeadsPanel';

const ActivitySection = () => {
  return (
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
  );
};

export default ActivitySection;
