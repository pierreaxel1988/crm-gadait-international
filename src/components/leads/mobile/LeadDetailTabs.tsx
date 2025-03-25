
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LeadDetailTabsProps {
  defaultTab?: string;
}

const LeadDetailTabs: React.FC<LeadDetailTabsProps> = ({ defaultTab = "status" }) => {
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="w-full grid grid-cols-4 bg-transparent">
        <TabsTrigger 
          value="info"
          className="py-2 px-1 data-[state=active]:border-b-2 data-[state=active]:border-chocolate-dark data-[state=active]:shadow-none rounded-none text-xs"
        >
          Général
        </TabsTrigger>
        <TabsTrigger 
          value="criteria"
          className="py-2 px-1 data-[state=active]:border-b-2 data-[state=active]:border-chocolate-dark data-[state=active]:shadow-none rounded-none text-xs"
        >
          Critères
        </TabsTrigger>
        <TabsTrigger 
          value="status"
          className="py-2 px-1 data-[state=active]:border-b-2 data-[state=active]:border-chocolate-dark data-[state=active]:shadow-none rounded-none text-xs"
        >
          Statut
        </TabsTrigger>
        <TabsTrigger 
          value="notes"
          className="py-2 px-1 data-[state=active]:border-b-2 data-[state=active]:border-chocolate-dark data-[state=active]:shadow-none rounded-none text-xs"
        >
          Notes
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default LeadDetailTabs;
