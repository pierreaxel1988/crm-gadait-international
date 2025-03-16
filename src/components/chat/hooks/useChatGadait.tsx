
import { useState } from 'react';
import { useChatMessages } from './useChatMessages';
import { useEmailExtraction } from './useEmailExtraction';
import { usePropertyExtraction } from './usePropertyExtraction';
import { extractLefigaroPropertyDetails } from '../utils/emailParsingUtils';
import { ExtractedData } from '../types/chatTypes';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useChatGadait = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | undefined>(undefined);
  
  const chatProps = useChatMessages();
  const emailProps = useEmailExtraction();
  const propertyProps = usePropertyExtraction();

  // Function to extract lead data from a message
  const extractLeadFromMessage = async (message: string) => {
    if (!message) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez entrer un message contenant des informations de lead."
      });
      return;
    }

    chatProps.setIsLoading(true);

    try {
      // Try to parse it directly first
      const lefigaroDetails = extractLefigaroPropertyDetails(message);
      
      if (Object.keys(lefigaroDetails).length > 0 && lefigaroDetails.email) {
        setExtractedData(lefigaroDetails);
        setShowLeadForm(true);
        chatProps.setIsLoading(false);
        return;
      }

      // If direct parsing fails, use the AI to extract data
      const { data, error } = await supabase.functions.invoke('chat-gadait', {
        body: { 
          message: message, 
          type: 'email-extract',
          content: message 
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Try to parse the AI response as JSON
      try {
        const extractedJson = JSON.parse(data.response);
        setExtractedData(extractedJson);
        setShowLeadForm(true);
      } catch (jsonError) {
        console.error('Error parsing JSON from AI response:', jsonError);
        toast({
          variant: "destructive",
          title: "Erreur d'extraction",
          description: "Impossible de parser les données du lead. Format de réponse invalide."
        });
      }
    } catch (error) {
      console.error('Error extracting lead data:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'extraire les données du lead."
      });
    } finally {
      chatProps.setIsLoading(false);
    }
  };

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
    extractedData: activeTab === 'email' ? emailProps.extractedData : (activeTab === 'property' ? propertyProps.extractedData : extractedData),
    createLeadFromData: emailProps.createLeadFromData,
    selectedPipeline: emailProps.selectedPipeline,
    setSelectedPipeline: emailProps.setSelectedPipeline,
    selectedAgent: selectedAgent,
    setSelectedAgent: setSelectedAgent,
    teamMembers: emailProps.teamMembers,
    showAssignmentForm: emailProps.showAssignmentForm,
    setShowAssignmentForm: emailProps.setShowAssignmentForm,
    
    // Property tab props
    propertyUrl: propertyProps.propertyUrl,
    setPropertyUrl: propertyProps.setPropertyUrl,
    extractPropertyData: propertyProps.extractPropertyData,
    
    // Tab management
    activeTab,
    setActiveTab,

    // Lead extraction directly from messages
    extractLeadFromMessage,
    showLeadForm,
    setShowLeadForm
  };
};
