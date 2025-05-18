
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import StatsSection from '@/components/dashboard/StatsSection';
import ActivitySection from '@/components/dashboard/ActivitySection';
import ImportedLeadsSection from '@/components/dashboard/ImportedLeadsSection';
import { useNavigate } from 'react-router-dom';
import NewLeadsAlert from '@/components/notifications/NewLeadsAlert';

const Index = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  return (
    <>
      <Navbar />
      <SubNavigation />
      <NewLeadsAlert />
      <div className="p-3 md:p-6 bg-white min-h-screen">
        <div className="grid gap-6">
          <StatsSection />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActivitySection />
            <ImportedLeadsSection />
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
