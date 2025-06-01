
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadDetailed } from '@/types/lead';
import LeadInfoTab from '@/components/leads/LeadInfoTab';
import ActionsTab from '@/components/leads/ActionsTab';
import NotesTab from '@/components/leads/NotesTab';
import EmailsTab from './tabs/EmailsTab';
import PublicCriteriaTab from '../PublicCriteriaTab';

interface LeadDetailTabsProps {
  lead: LeadDetailed;
  onLeadUpdate: (updatedLead: LeadDetailed) => void;
  defaultTab?: string;
  pendingActionsCount?: number;
}

const LeadDetailTabs: React.FC<LeadDetailTabsProps> = ({
  lead,
  onLeadUpdate,
  defaultTab = "info",
  pendingActionsCount = 0
}) => {
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full grid-cols-5 bg-gray-100">
        <TabsTrigger value="info" className="text-xs">Info</TabsTrigger>
        <TabsTrigger value="actions" className="text-xs">Actions</TabsTrigger>
        <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
        <TabsTrigger value="emails" className="text-xs">Emails</TabsTrigger>
        <TabsTrigger value="criteria" className="text-xs">Partage</TabsTrigger>
      </TabsList>
      
      <TabsContent value="info" className="mt-0">
        <LeadInfoTab lead={lead} onLeadUpdate={onLeadUpdate} />
      </TabsContent>
      
      <TabsContent value="actions" className="mt-0">
        <ActionsTab lead={lead} onLeadUpdate={onLeadUpdate} />
      </TabsContent>
      
      <TabsContent value="notes" className="mt-0">
        <NotesTab lead={lead} onLeadUpdate={onLeadUpdate} />
      </TabsContent>
      
      <TabsContent value="emails" className="mt-0">
        <EmailsTab leadId={lead.id} />
      </TabsContent>

      <TabsContent value="criteria" className="mt-0">
        <PublicCriteriaTab lead={lead} />
      </TabsContent>
    </Tabs>
  );
};

export default LeadDetailTabs;
