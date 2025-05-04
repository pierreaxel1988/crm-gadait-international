
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, FileText, Info, Target, Activity } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface LeadDetailTabsProps {
  defaultTab?: string;
  pendingActionsCount?: number;
}

const LeadDetailTabs: React.FC<LeadDetailTabsProps> = ({
  defaultTab = 'info',
  pendingActionsCount = 0
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = new URLSearchParams(location.search).get('tab') || defaultTab;

  const handleTabChange = (value: string) => {
    // Update URL with tab parameter
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', value);
    navigate(`${location.pathname}?${searchParams.toString()}`, {
      replace: true
    });
  };

  return <>
      <Separator className="bg-loro-pearl/60 h-[1px] w-full opacity-80" />
      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full border-b border-loro-sand/10">
        <TabsList className="grid grid-cols-5 w-full h-14 rounded-none px-1 bg-loro-terracotta">
          <TabsTrigger value="criteria" className="data-[state=active]:bg-transparent data-[state=active]:text-loro-900 font-medium rounded-none pt-1">
            <div className="flex flex-col items-center">
              <Target className="h-4 w-4 mb-1 text-loro-50 data-[state=active]:text-loro-900" />
              <span className="text-xs text-loro-50 data-[state=active]:text-loro-900">Critères</span>
            </div>
          </TabsTrigger>
          
          <TabsTrigger value="info" className="data-[state=active]:bg-transparent data-[state=active]:text-loro-900 font-medium rounded-none pt-1">
            <div className="flex flex-col items-center">
              <Info className="h-4 w-4 mb-1 text-loro-50 data-[state=active]:text-loro-900" />
              <span className="text-xs text-loro-50 data-[state=active]:text-loro-900">Infos</span>
            </div>
          </TabsTrigger>
          
          <TabsTrigger value="status" className="data-[state=active]:bg-transparent data-[state=active]:text-loro-900 font-medium rounded-none pt-1">
            <div className="flex flex-col items-center">
              <Check className="h-4 w-4 mb-1 text-loro-50 data-[state=active]:text-loro-900" />
              <span className="text-xs text-loro-50 data-[state=active]:text-loro-900">Statut</span>
            </div>
          </TabsTrigger>
          
          <TabsTrigger value="notes" className="data-[state=active]:bg-transparent data-[state=active]:text-loro-900 font-medium rounded-none pt-1">
            <div className="flex flex-col items-center">
              <FileText className="h-4 w-4 mb-1 text-loro-50 data-[state=active]:text-loro-900" />
              <span className="text-xs text-loro-50 data-[state=active]:text-loro-900">Notes</span>
            </div>
          </TabsTrigger>
          
          <TabsTrigger value="actions" className="data-[state=active]:bg-transparent data-[state=active]:text-loro-900 font-medium rounded-none pt-1 relative">
            <div className="flex flex-col items-center">
              <Activity className="h-4 w-4 mb-1 text-loro-50 data-[state=active]:text-loro-900" />
              <span className="text-xs text-loro-50 data-[state=active]:text-loro-900">Actions</span>
              {pendingActionsCount > 0 && <div className="absolute -top-1 -right-1 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs bg-loro-900 px-0 mx-[10px]">
                {pendingActionsCount}
              </div>}
            </div>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </>;
};

export default LeadDetailTabs;
