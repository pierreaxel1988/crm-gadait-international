import React, { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useChatGadait } from './hooks/useChatGadait';
import ChatHeader from './ChatHeader';
import ChatTabsComponent from './ChatTabsComponent';
import { LeadDetailed } from '@/types/lead';

interface ChatGadaitProps {
  isOpen: boolean;
  onClose: () => void;
  leadData?: LeadDetailed;
}

const ChatGadait: React.FC<ChatGadaitProps> = ({ isOpen, onClose, leadData }) => {
  const isMobile = useIsMobile();
  const {
    messages,
    input,
    setInput,
    isLoading,
    activeTab,
    setActiveTab,
    emailContent,
    setEmailContent,
    propertyUrl,
    setPropertyUrl,
    extractedData,
    messagesEndRef,
    handleSendMessage,
    extractEmailData,
    extractPropertyData,
    createLeadFromData,
    selectedPipeline,
    setSelectedPipeline,
    selectedAgent,
    setSelectedAgent,
    teamMembers,
    showAssignmentForm,
    setShowAssignmentForm
  } = useChatGadait();

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const chatTabProps = {
    messages,
    input,
    setInput,
    isLoading,
    handleSendMessage,
    messagesEndRef
  };

  const emailTabProps = {
    emailContent,
    setEmailContent,
    extractEmailData,
    isLoading,
    extractedData,
    createLeadFromData,
    selectedPipeline,
    setSelectedPipeline,
    selectedAgent,
    setSelectedAgent,
    teamMembers,
    showAssignmentForm,
    setShowAssignmentForm
  };

  const propertyTabProps = {
    propertyUrl,
    setPropertyUrl,
    extractPropertyData,
    isLoading,
    extractedData
  };

  // For full-page mode, we'll adjust the UI to fill the available space
  return (
    <div className="h-full flex flex-col">
      {/* We'll keep the header for visual consistency but hide the close button in the full-page version */}
      <div className="hidden">
        <ChatHeader onClose={onClose} />
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ChatTabsComponent
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          chatTabProps={chatTabProps}
          emailTabProps={emailTabProps}
          propertyTabProps={propertyTabProps}
        />
      </div>
    </div>
  );
};

export default ChatGadait;
