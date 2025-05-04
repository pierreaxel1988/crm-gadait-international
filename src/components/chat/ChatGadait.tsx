
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
    propertyUrl,
    setPropertyUrl,
    extractedData,
    messagesEndRef,
    handleSendMessage,
    extractPropertyData
  } = useChatGadait(leadData);

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
          propertyTabProps={propertyTabProps}
        />
      </div>
    </div>
  );
};

export default ChatGadait;
