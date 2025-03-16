
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import LeadForm from '@/components/leads/LeadForm';
import ActionsPanel from '@/components/leads/actions/ActionsPanel';
import { LeadDetailed } from '@/types/lead';
import { TaskType } from '@/components/kanban/KanbanCard';

interface LeadTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lead: LeadDetailed;
  onSubmit: (data: LeadDetailed) => void;
  onCancel: () => void;
  markActionComplete: (actionId: string) => void;
  getActionTypeIcon: (type: TaskType) => React.ReactNode;
  onAddAction: () => void;
}

const LeadTabs: React.FC<LeadTabsProps> = ({
  activeTab,
  setActiveTab,
  lead,
  onSubmit,
  onCancel,
  markActionComplete,
  getActionTypeIcon,
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
          <LeadForm lead={lead} onSubmit={onSubmit} onCancel={onCancel} activeTab="informations" />
        </div>
      </TabsContent>
      
      <TabsContent value="criteres" className="mt-4">
        <div className="luxury-card p-6">
          <LeadForm lead={lead} onSubmit={onSubmit} onCancel={onCancel} activeTab="criteres" />
        </div>
      </TabsContent>
      
      <TabsContent value="statut" className="mt-4">
        <div className="luxury-card p-6">
          <LeadForm lead={lead} onSubmit={onSubmit} onCancel={onCancel} activeTab="statut" />
        </div>
      </TabsContent>
      
      <TabsContent value="actions" className="mt-4">
        <ActionsPanel 
          lead={lead}
          getActionTypeIcon={getActionTypeIcon}
          onMarkComplete={markActionComplete}
          onAddAction={onAddAction}
        />
      </TabsContent>
    </Tabs>
  );
};

export default LeadTabs;
