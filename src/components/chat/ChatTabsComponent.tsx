
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChatTab from './ChatTabs/ChatTab';
import PropertyTab from './ChatTabs/PropertyTab';
import { MessageSquare, Building2 } from 'lucide-react';
import { LeadDetailed } from '@/types/lead';

interface ChatTabsComponentProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  chatTabProps: {
    messages: any[];
    input: string;
    setInput: (input: string) => void;
    isLoading: boolean;
    handleSendMessage: () => void;
    messagesEndRef: React.RefObject<HTMLDivElement>;
    suggestedPrompts?: string[];
  };
  propertyTabProps: {
    propertyUrl: string;
    setPropertyUrl: (url: string) => void;
    extractPropertyData: () => Promise<void>;
    isLoading: boolean;
    extractedData: any;
  };
  leadData?: LeadDetailed;
}

const ChatTabsComponent: React.FC<ChatTabsComponentProps> = ({
  activeTab,
  setActiveTab,
  chatTabProps,
  propertyTabProps,
  leadData
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col relative">
      <div className="border-b border-loro-sand/30 sticky top-0 bg-white z-10">
        <TabsList className="h-12 w-full bg-transparent relative">
          <TabsTrigger
            value="chat"
            className="flex-1 data-[state=active]:text-loro-terracotta rounded-none relative data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:w-full data-[state=active]:after:h-[2px] data-[state=active]:after:bg-loro-terracotta"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </TabsTrigger>
          <TabsTrigger
            value="property"
            className="flex-1 data-[state=active]:text-loro-terracotta rounded-none relative data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:w-full data-[state=active]:after:h-[2px] data-[state=active]:after:bg-loro-terracotta"
          >
            <Building2 className="h-4 w-4 mr-2" />
            Propriétés
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="chat" className="h-full overflow-hidden pt-0 m-0 flex-1">
        <ChatTab
          messages={chatTabProps.messages}
          input={chatTabProps.input}
          setInput={chatTabProps.setInput}
          isLoading={chatTabProps.isLoading}
          handleSendMessage={chatTabProps.handleSendMessage}
          messagesEndRef={chatTabProps.messagesEndRef}
          suggestedPrompts={chatTabProps.suggestedPrompts}
          leadData={leadData}
        />
      </TabsContent>

      <TabsContent value="property" className="h-full overflow-hidden pt-0 m-0 flex-1">
        <PropertyTab
          propertyUrl={propertyTabProps.propertyUrl}
          setPropertyUrl={propertyTabProps.setPropertyUrl}
          extractPropertyData={propertyTabProps.extractPropertyData}
          isLoading={propertyTabProps.isLoading}
          extractedData={propertyTabProps.extractedData}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ChatTabsComponent;
