
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, Info, Search, Hash, StickyNote } from 'lucide-react';

interface LeadDetailTabsProps {
  defaultTab?: string;
}

const LeadDetailTabs: React.FC<LeadDetailTabsProps> = ({ defaultTab = 'info' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = new URLSearchParams(location.search).get('tab') || defaultTab;

  const handleTabChange = (value: string) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', value);
    navigate(`${location.pathname}?${searchParams.toString()}`);
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="w-full h-12 grid grid-cols-5 bg-loro-50/50 rounded-none border-y border-loro-sand/20">
        <TabsTrigger 
          value="info" 
          className="data-[state=active]:bg-white rounded-none border-r border-loro-sand/20 flex flex-col items-center pt-1.5"
        >
          <Info className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Général</span>
        </TabsTrigger>
        <TabsTrigger 
          value="criteria" 
          className="data-[state=active]:bg-white rounded-none border-r border-loro-sand/20 flex flex-col items-center pt-1.5"
        >
          <Search className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Critères</span>
        </TabsTrigger>
        <TabsTrigger 
          value="status" 
          className="data-[state=active]:bg-white rounded-none border-r border-loro-sand/20 flex flex-col items-center pt-1.5"
        >
          <Hash className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Statut</span>
        </TabsTrigger>
        <TabsTrigger 
          value="notes" 
          className="data-[state=active]:bg-white rounded-none border-r border-loro-sand/20 flex flex-col items-center pt-1.5"
        >
          <StickyNote className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Notes</span>
        </TabsTrigger>
        <TabsTrigger 
          value="actions" 
          className="data-[state=active]:bg-white rounded-none flex flex-col items-center pt-1.5"
        >
          <ClipboardList className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Actions</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default LeadDetailTabs;
