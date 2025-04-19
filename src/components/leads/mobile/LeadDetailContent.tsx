
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ActionHistory } from '@/types/actionHistory';
import { LeadDetailed } from '@/types/lead';
import GeneralInfoSection from '../form/mobile/GeneralInfoSection';
import SearchCriteriaSection from '../form/mobile/SearchCriteriaSection';
import StatusSection from '../form/mobile/StatusSection';
import NotesSection from '../form/mobile/NotesSection';
import EmailsTab from './tabs/EmailsTab';
import ActionSuggestions from '../actions/ActionSuggestions';
import ActionsPanelMobile from '../actions/ActionsPanelMobile';
import { ActionSuggestion } from '@/services/noteAnalysisService';

interface LeadDetailContentProps {
  lead: LeadDetailed;
  activeTab: string;
  onDataChange: (data: Partial<LeadDetailed>) => void;
  actionSuggestions?: ActionSuggestion[];
  onAcceptSuggestion: (suggestion: ActionSuggestion) => void;
  onRejectSuggestion: (suggestion: ActionSuggestion) => void;
  onMarkComplete: (action: ActionHistory) => void;
  fetchLead: () => Promise<void>;
}

const LeadDetailContent: React.FC<LeadDetailContentProps> = ({
  lead,
  activeTab,
  onDataChange,
  actionSuggestions,
  onAcceptSuggestion,
  onRejectSuggestion,
  onMarkComplete,
  fetchLead
}) => {
  return (
    <ScrollArea className="flex-1 overflow-y-auto pt-0 pb-20">
      <Tabs value={activeTab} className="w-full h-full">
        <div className="px-4 pb-32 h-full">
          <TabsContent value="info" className="mt-0 animate-[fade-in_0.2s_ease-out]">
            <GeneralInfoSection lead={lead} onDataChange={onDataChange} />
          </TabsContent>
          
          <TabsContent value="criteria" className="mt-0 animate-[fade-in_0.2s_ease-out]">
            <SearchCriteriaSection lead={lead} onDataChange={onDataChange} />
          </TabsContent>
          
          <TabsContent value="status" className="mt-0 animate-[fade-in_0.2s_ease-out]">
            <StatusSection lead={lead} onDataChange={onDataChange} />
          </TabsContent>
          
          <TabsContent value="notes" className="mt-0 animate-[fade-in_0.2s_ease-out]">
            <NotesSection lead={lead} onDataChange={onDataChange} />
          </TabsContent>
          
          <TabsContent value="actions" className="mt-0 animate-[fade-in_0.2s_ease-out]">
            {actionSuggestions && actionSuggestions.length > 0 && (
              <ActionSuggestions
                suggestions={actionSuggestions}
                onAccept={onAcceptSuggestion}
                onReject={onRejectSuggestion}
              />
            )}
            <ActionsPanelMobile 
              leadId={lead.id} 
              onAddAction={fetchLead}
              onMarkComplete={onMarkComplete}
              actionHistory={lead.actionHistory || []}
            />
          </TabsContent>
          
          <TabsContent value="emails" className="h-full flex-1 flex-grow mt-0">
            <EmailsTab leadId={lead.id} />
          </TabsContent>
        </div>
      </Tabs>
    </ScrollArea>
  );
};

export default LeadDetailContent;
