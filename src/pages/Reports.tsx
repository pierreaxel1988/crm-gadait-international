
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportsHeader from '@/components/reports/ReportsHeader';
import PerformanceTabContent from '@/components/reports/PerformanceTabContent';
import LeadsTabContent from '@/components/reports/LeadsTabContent';
import ConversionTabContent from '@/components/reports/ConversionTabContent';
import MarketingTabContent from '@/components/reports/MarketingTabContent';
import { useIsMobile } from '@/hooks/use-mobile';

const Reports = () => {
  const [period, setPeriod] = useState<string>('month');
  const isMobile = useIsMobile();
  
  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1920px] mx-auto">
      <ReportsHeader period={period} setPeriod={setPeriod} />
      
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className={`mb-6 flex flex-wrap ${isMobile ? 'overflow-x-auto pb-2' : ''}`}>
          <TabsTrigger value="performance" className="flex-1 sm:flex-none text-sm">Performance</TabsTrigger>
          <TabsTrigger value="leads" className="flex-1 sm:flex-none text-sm">Leads</TabsTrigger>
          <TabsTrigger value="conversion" className="flex-1 sm:flex-none text-sm">Conversion</TabsTrigger>
          <TabsTrigger value="marketing" className="flex-1 sm:flex-none text-sm">Marketing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance">
          <PerformanceTabContent period={period} />
        </TabsContent>
        
        <TabsContent value="leads">
          <LeadsTabContent period={period} />
        </TabsContent>
        
        <TabsContent value="conversion">
          <ConversionTabContent period={period} />
        </TabsContent>
        
        <TabsContent value="marketing">
          <MarketingTabContent period={period} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
