
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Building } from 'lucide-react';
import ChatTab from './ChatTabs/ChatTab';
import PropertyTab from './ChatTabs/PropertyTab';
import EmailTab from './ChatTabs/EmailTab';
import { LeadDetailed } from '@/types/lead';

interface ChatTabsComponentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  chatTabProps: any;
  propertyTabProps: any;
  emailTabProps?: any;
  leadData?: LeadDetailed;
}

const ChatTabsComponent: React.FC<ChatTabsComponentProps> = ({
  activeTab,
  setActiveTab,
  chatTabProps,
  propertyTabProps,
  emailTabProps,
  leadData
}) => {
  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="h-full flex flex-col"
    >
      <TabsList className="grid grid-cols-2 mx-4 my-2">
        <TabsTrigger value="chat" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span className="text-base font-normal">Chat</span>
        </TabsTrigger>
        <TabsTrigger value="property" className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          <span className="text-base font-normal">Propriétés</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="chat" className="flex-1 overflow-hidden relative">
        <ChatTab {...chatTabProps} leadData={leadData} />
      </TabsContent>
      <TabsContent value="property" className="flex-1 overflow-hidden">
        <PropertyTab {...propertyTabProps} />
      </TabsContent>
      {emailTabProps && (
        <TabsContent value="email" className="flex-1 overflow-hidden">
          <EmailTab {...emailTabProps} />
        </TabsContent>
      )}
    </Tabs>
  );
};

export default ChatTabsComponent;
