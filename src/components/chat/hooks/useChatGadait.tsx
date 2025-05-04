
import { useState } from 'react';
import { useChatMessages } from './useChatMessages';
import { usePropertyExtraction } from './usePropertyExtraction';

export const useChatGadait = () => {
  const [activeTab, setActiveTab] = useState('chat');
  
  const chatProps = useChatMessages();
  const propertyProps = usePropertyExtraction();

  return {
    // Chat tab props
    messages: chatProps.messages,
    input: chatProps.input,
    setInput: chatProps.setInput,
    isLoading: chatProps.isLoading || propertyProps.isLoading,
    messagesEndRef: chatProps.messagesEndRef,
    handleSendMessage: chatProps.handleSendMessage,
    
    // Property tab props
    propertyUrl: propertyProps.propertyUrl,
    setPropertyUrl: propertyProps.setPropertyUrl,
    extractPropertyData: propertyProps.extractPropertyData,
    extractedData: activeTab === 'property' ? propertyProps.extractedData : null,
    
    // Tab management
    activeTab,
    setActiveTab,
  };
};
