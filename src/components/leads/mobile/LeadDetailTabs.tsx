
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

interface LeadDetailTabsProps {
  defaultTab?: string;
}

const LeadDetailTabs: React.FC<LeadDetailTabsProps> = ({
  defaultTab = "criteria"
}) => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || defaultTab;
  const handleTabChange = (value: string) => {
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set('tab', value);
    navigate(`/leads/${id}?${newSearchParams.toString()}`, {
      replace: true
    });
  };
  return <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="w-full grid grid-cols-6 bg-loro-50 border-t border-b border-loro-200/50 shadow-sm py-0.5">
        <TabsTrigger 
          value="info" 
          className="py-1.5 px-1 rounded-none text-xs text-loro-700 transition-all duration-200 
          data-[state=active]:bg-transparent 
          data-[state=active]:text-chocolate-dark 
          data-[state=active]:font-medium
          data-[state=active]:border-b-2
          data-[state=active]:border-chocolate-dark
          data-[state=active]:shadow-none"
        >
          Général
        </TabsTrigger>
        <TabsTrigger 
          value="criteria" 
          className="py-1.5 px-1 rounded-none text-xs text-loro-700 transition-all duration-200 
          data-[state=active]:bg-transparent 
          data-[state=active]:text-chocolate-dark 
          data-[state=active]:font-medium
          data-[state=active]:border-b-2
          data-[state=active]:border-chocolate-dark
          data-[state=active]:shadow-none"
        >
          Critères
        </TabsTrigger>
        <TabsTrigger 
          value="status" 
          className="py-1.5 px-1 rounded-none text-xs text-loro-700 transition-all duration-200 
          data-[state=active]:bg-transparent 
          data-[state=active]:text-chocolate-dark 
          data-[state=active]:font-medium
          data-[state=active]:border-b-2
          data-[state=active]:border-chocolate-dark
          data-[state=active]:shadow-none"
        >
          Statut
        </TabsTrigger>
        <TabsTrigger 
          value="notes" 
          className="py-1.5 px-1 rounded-none text-xs text-loro-700 transition-all duration-200 
          data-[state=active]:bg-transparent 
          data-[state=active]:text-chocolate-dark 
          data-[state=active]:font-medium
          data-[state=active]:border-b-2
          data-[state=active]:border-chocolate-dark
          data-[state=active]:shadow-none"
        >
          Notes
        </TabsTrigger>
        <TabsTrigger 
          value="actions" 
          className="py-1.5 px-1 rounded-none text-xs text-loro-700 transition-all duration-200 
          data-[state=active]:bg-transparent 
          data-[state=active]:text-chocolate-dark 
          data-[state=active]:font-medium
          data-[state=active]:border-b-2
          data-[state=active]:border-chocolate-dark
          data-[state=active]:shadow-none"
        >
          Actions
        </TabsTrigger>
        <TabsTrigger 
          value="emails" 
          className="py-1.5 px-1 rounded-none text-xs text-loro-700 transition-all duration-200 
          data-[state=active]:bg-transparent 
          data-[state=active]:text-chocolate-dark 
          data-[state=active]:font-medium
          data-[state=active]:border-b-2
          data-[state=active]:border-chocolate-dark
          data-[state=active]:shadow-none"
        >
          Emails
        </TabsTrigger>
      </TabsList>
    </Tabs>;
};

export default LeadDetailTabs;
