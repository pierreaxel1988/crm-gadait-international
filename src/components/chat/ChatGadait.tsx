
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
    createLeadFromData
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
    createLeadFromData
  };

  const propertyTabProps = {
    propertyUrl,
    setPropertyUrl,
    extractPropertyData,
    isLoading,
    extractedData
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-end animate-fade-in">
      <div 
        className={`bg-loro-white w-full ${isMobile ? 'max-w-full' : 'max-w-md'} flex flex-col h-full shadow-luxury transition-all duration-300 animate-slide-in-right`}
      >
        <ChatHeader onClose={onClose} />
        
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
