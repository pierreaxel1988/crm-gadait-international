
import { useState } from 'react';
import { useChatMessages } from './useChatMessages';
import { useEmailExtraction } from './useEmailExtraction';
import { usePropertyExtraction } from './usePropertyExtraction';

export const useChatGadait = () => {
  const [activeTab, setActiveTab] = useState('chat');
  
  const chatProps = useChatMessages();
  const emailProps = useEmailExtraction();
  const propertyProps = usePropertyExtraction();

  return {
    // Chat tab props
    messages: chatProps.messages,
    input: chatProps.input,
    setInput: chatProps.setInput,
    isLoading: chatProps.isLoading || emailProps.isLoading || propertyProps.isLoading,
    messagesEndRef: chatProps.messagesEndRef,
    handleSendMessage: chatProps.handleSendMessage,
    
    // Email tab props
    emailContent: emailProps.emailContent,
    setEmailContent: emailProps.setEmailContent,
    extractEmailData: emailProps.extractEmailData,
    extractedData: activeTab === 'email' ? emailProps.extractedData : (activeTab === 'property' ? propertyProps.extractedData : null),
    createLeadFromData: emailProps.createLeadFromData,
    selectedPipeline: emailProps.selectedPipeline,
    setSelectedPipeline: emailProps.setSelectedPipeline,
    selectedAgent: emailProps.selectedAgent,
    setSelectedAgent: emailProps.setSelectedAgent,
    teamMembers: emailProps.teamMembers,
    
    // Property tab props
    propertyUrl: propertyProps.propertyUrl,
    setPropertyUrl: propertyProps.setPropertyUrl,
    extractPropertyData: propertyProps.extractPropertyData,
    
    // Tab management
    activeTab,
    setActiveTab,
  };
};
