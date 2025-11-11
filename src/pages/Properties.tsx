import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import PropertiesTabContent from '@/components/pipeline/PropertiesTabContent';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

const Properties = () => {
  const isMobile = useIsMobile();
  const [locale, setLocale] = useState<'fr' | 'en'>('fr');

  return <div className="flex flex-col min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
        <SubNavigation />
      </div>
      
      <div className={`pt-[144px] bg-white min-h-screen ${isMobile ? 'px-4' : 'px-[35px]'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-gray-900 font-medium">Propriétés Gadait.</h1>
              <p className="text-gray-600 mt-2">Explorez notre catalogue de propriétés de luxe</p>
            </div>
            
            <div className="flex gap-2 items-center">
              <Globe className="h-4 w-4 text-gray-500" />
              <Button
                variant={locale === 'fr' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLocale('fr')}
                className="font-medium"
              >
                FR
              </Button>
              <Button
                variant={locale === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLocale('en')}
                className="font-medium"
              >
                EN
              </Button>
            </div>
          </div>
          
          <PropertiesTabContent locale={locale} />
        </div>
      </div>
    </div>;
};
export default Properties;