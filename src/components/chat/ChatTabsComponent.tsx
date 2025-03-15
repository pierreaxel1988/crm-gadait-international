
import React from 'react';
import { MessageSquare, Mail, Home } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChatTab from './ChatTabs/ChatTab';
import EmailTab from './ChatTabs/EmailTab';
import PropertyTab from './ChatTabs/PropertyTab';

interface ChatTabsComponentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  chatTabProps: React.ComponentProps<typeof ChatTab>;
  emailTabProps: React.ComponentProps<typeof EmailTab>;
  propertyTabProps: React.ComponentProps<typeof PropertyTab>;
}

const ChatTabsComponent: React.FC<ChatTabsComponentProps> = ({
  activeTab,
  setActiveTab,
  chatTabProps,
  emailTabProps,
  propertyTabProps
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
      <div className="bg-loro-pearl/50 p-2">
        <TabsList className="grid grid-cols-3 w-full bg-loro-white border border-loro-sand">
          <TabsTrigger 
            value="chat" 
            className="data-[state=active]:bg-loro-sand/20 data-[state=active]:text-loro-navy"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </TabsTrigger>
          <TabsTrigger 
            value="email"
            className="data-[state=active]:bg-loro-sand/20 data-[state=active]:text-loro-navy"
          >
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger 
            value="property"
            className="data-[state=active]:bg-loro-sand/20 data-[state=active]:text-loro-navy"
          >
            <Home className="h-4 w-4 mr-2" />
            Propriété
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden m-0">
        <ChatTab {...chatTabProps} />
      </TabsContent>
      
      <TabsContent value="email" className="flex-1 flex flex-col overflow-hidden m-0">
        <EmailTab {...emailTabProps} />
      </TabsContent>
      
      <TabsContent value="property" className="flex-1 flex flex-col overflow-hidden m-0">
        <PropertyTab {...propertyTabProps} />
      </TabsContent>
    </Tabs>
  );
};

export default ChatTabsComponent;
