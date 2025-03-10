
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LeadDetailed } from '@/types/lead';
import LeadForm from '@/components/leads/LeadForm';
import ActionsPanel from '@/components/leads/actions/ActionsPanel';
import { ActionType } from '@/hooks/useLeadActions';

interface LeadTabsProps {
  lead?: LeadDetailed;
  activeTab: string;
  setActiveTab: (value: string) => void;
  handleSubmit: (data: LeadDetailed) => void;
  onNavigateBack: () => void;
  getActionTypeIcon: (type: ActionType) => JSX.Element;
  markActionComplete: (actionId: string) => void;
  onAddAction: () => void;
}

const LeadTabs: React.FC<LeadTabsProps> = ({
  lead,
  activeTab,
  setActiveTab,
  handleSubmit,
  onNavigateBack,
  getActionTypeIcon,
  markActionComplete,
  onAddAction
}) => {
  return (
    <Tabs 
      value={activeTab} 
      onValueChange={setActiveTab} 
      className="w-full"
    >
      <TabsList className="w-full bg-background border-b flex justify-between overflow-x-auto">
        <TabsTrigger 
          value="informations" 
          className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-chocolate-dark data-[state=active]:shadow-none rounded-none"
        >
          Informations générales
        </TabsTrigger>
        <TabsTrigger 
          value="criteres" 
          className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-chocolate-dark data-[state=active]:shadow-none rounded-none"
        >
          Critères de recherche
        </TabsTrigger>
        <TabsTrigger 
          value="statut" 
          className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-chocolate-dark data-[state=active]:shadow-none rounded-none"
        >
          Statut et suivi
        </TabsTrigger>
        <TabsTrigger 
          value="actions" 
          className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-chocolate-dark data-[state=active]:shadow-none rounded-none"
        >
          Actions/Tâches
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="informations" className="mt-4">
        <div className="luxury-card p-6">
          <LeadForm lead={lead} onSubmit={handleSubmit} onCancel={onNavigateBack} activeTab="informations" />
        </div>
      </TabsContent>
      
      <TabsContent value="criteres" className="mt-4">
        <div className="luxury-card p-6">
          <LeadForm lead={lead} onSubmit={handleSubmit} onCancel={onNavigateBack} activeTab="criteres" />
        </div>
      </TabsContent>
      
      <TabsContent value="statut" className="mt-4">
        <div className="luxury-card p-6">
          <LeadForm lead={lead} onSubmit={handleSubmit} onCancel={onNavigateBack} activeTab="statut" />
        </div>
      </TabsContent>
      
      <TabsContent value="actions" className="mt-4">
        {lead && (
          <ActionsPanel 
            lead={lead}
            getActionTypeIcon={getActionTypeIcon}
            onMarkComplete={markActionComplete}
            onAddAction={onAddAction}
          />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default LeadTabs;
