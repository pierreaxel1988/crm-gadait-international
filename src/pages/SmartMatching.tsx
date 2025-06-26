
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import SmartMatchingDashboard from '@/components/matching/SmartMatchingDashboard';

const SmartMatching = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
        <SubNavigation />
      </div>
      
      <div className={`pt-[144px] bg-white min-h-screen ${isMobile ? 'px-4' : 'px-[35px]'}`}>
        <div className="max-w-7xl mx-auto">
          <SmartMatchingDashboard />
        </div>
      </div>
    </div>
  );
};

export default SmartMatching;
