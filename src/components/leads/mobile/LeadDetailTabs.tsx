import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

interface LeadDetailTabsProps {
  defaultTab?: string;
}

const LeadDetailTabs: React.FC<LeadDetailTabsProps> = ({
  defaultTab = "criteria"
}) => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
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
      <TabsList className="w-full grid grid-cols-6 bg-loro-50 border-t border-b border-loro-200/50 shadow-sm">
        <TabsTrigger 
          value="info" 
          className="py-2 px-1 
            text-xs 
            text-loro-600 
            data-[state=active]:text-loro-900 
            data-[state=active]:font-semibold 
            transition-colors 
            duration-200 
            ease-in-out 
            relative 
            group"
        >
          <span className="relative">
            Général
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-loro-900 scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300 origin-center"></span>
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="criteria" 
          className="py-2 px-1 
            text-xs 
            text-loro-600 
            data-[state=active]:text-loro-900 
            data-[state=active]:font-semibold 
            transition-colors 
            duration-200 
            ease-in-out 
            relative 
            group"
        >
          <span className="relative">
            Critères
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-loro-900 scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300 origin-center"></span>
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="status" 
          className="py-2 px-1 
            text-xs 
            text-loro-600 
            data-[state=active]:text-loro-900 
            data-[state=active]:font-semibold 
            transition-colors 
            duration-200 
            ease-in-out 
            relative 
            group"
        >
          <span className="relative">
            Statut
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-loro-900 scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300 origin-center"></span>
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="notes" 
          className="py-2 px-1 
            text-xs 
            text-loro-600 
            data-[state=active]:text-loro-900 
            data-[state=active]:font-semibold 
            transition-colors 
            duration-200 
            ease-in-out 
            relative 
            group"
        >
          <span className="relative">
            Notes
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-loro-900 scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300 origin-center"></span>
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="actions" 
          className="py-2 px-1 
            text-xs 
            text-loro-600 
            data-[state=active]:text-loro-900 
            data-[state=active]:font-semibold 
            transition-colors 
            duration-200 
            ease-in-out 
            relative 
            group"
        >
          <span className="relative">
            Actions
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-loro-900 scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300 origin-center"></span>
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="emails" 
          className="py-2 px-1 
            text-xs 
            text-loro-600 
            data-[state=active]:text-loro-900 
            data-[state=active]:font-semibold 
            transition-colors 
            duration-200 
            ease-in-out 
            relative 
            group"
        >
          <span className="relative">
            Emails
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-loro-900 scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300 origin-center"></span>
          </span>
        </TabsTrigger>
      </TabsList>
    </Tabs>;
};

export default LeadDetailTabs;
