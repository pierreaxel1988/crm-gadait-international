
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
      <div className="bg-loro-pearl/30 px-4 py-2 border-b border-loro-sand/20">
        <TabsList className="grid grid-cols-3 w-full bg-loro-white/80 border border-loro-sand/30 rounded-md overflow-hidden">
          <TabsTrigger 
            value="chat" 
            className="data-[state=active]:bg-loro-sand/10 data-[state=active]:text-loro-hazel font-medium transition-all duration-200"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </TabsTrigger>
          <TabsTrigger 
            value="email"
            className="data-[state=active]:bg-loro-sand/10 data-[state=active]:text-loro-hazel font-medium transition-all duration-200"
          >
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger 
            value="property"
            className="data-[state=active]:bg-loro-sand/10 data-[state=active]:text-loro-hazel font-medium transition-all duration-200"
          >
            <Home className="h-4 w-4 mr-2" />
            Propriété
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden m-0 p-0">
        <ChatTab {...chatTabProps} />
      </TabsContent>
      
      <TabsContent value="email" className="flex-1 flex flex-col overflow-hidden m-0 p-0">
        <EmailTab {...emailTabProps} />
      </TabsContent>
      
      <TabsContent value="property" className="flex-1 flex flex-col overflow-hidden m-0 p-0">
        <PropertyTab {...propertyTabProps} />
      </TabsContent>
    </Tabs>
  );
};

export default ChatTabsComponent;
