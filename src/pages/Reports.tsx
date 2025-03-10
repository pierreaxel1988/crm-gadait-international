
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportsHeader from '@/components/reports/ReportsHeader';
import PerformanceTabContent from '@/components/reports/PerformanceTabContent';
import LeadsTabContent from '@/components/reports/LeadsTabContent';
import ConversionTabContent from '@/components/reports/ConversionTabContent';

const Reports = () => {
  const [period, setPeriod] = useState('month');
  
  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1920px] mx-auto">
      <ReportsHeader period={period} setPeriod={setPeriod} />
      
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="mb-6 flex flex-wrap">
          <TabsTrigger value="performance" className="flex-1 sm:flex-none">Performance</TabsTrigger>
          <TabsTrigger value="leads" className="flex-1 sm:flex-none">Leads</TabsTrigger>
          <TabsTrigger value="conversion" className="flex-1 sm:flex-none">Conversion</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance">
          <PerformanceTabContent />
        </TabsContent>
        
        <TabsContent value="leads">
          <LeadsTabContent />
        </TabsContent>
        
        <TabsContent value="conversion">
          <ConversionTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
