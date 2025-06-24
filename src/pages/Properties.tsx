
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import PropertiesTabContent from '@/components/pipeline/PropertiesTabContent';

const Properties = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
        <SubNavigation />
      </div>
      
      <div className={`pt-[144px] bg-white min-h-screen ${isMobile ? 'px-4' : 'px-[35px]'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Propriétés Gadait</h1>
            <p className="text-gray-600 mt-2">Explorez notre catalogue de propriétés de luxe</p>
          </div>
          
          <PropertiesTabContent />
        </div>
      </div>
    </div>
  );
};

export default Properties;
