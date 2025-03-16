
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { createLead } from '@/services/leadCore';
import { Country, PropertyType, LeadDetailed } from '@/types/lead';
import { TaskType } from '@/components/kanban/KanbanCard';
import { supabase } from '@/integrations/supabase/client';
import { ExtractedData } from '@/components/chat/types/chatTypes';

export const useLeadExtraction = () => {
  const navigate = useNavigate();
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | undefined>(undefined);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [agentName, setAgentName] = useState<string | undefined>();

  // Fetch agent name when selectedAgent changes
  useEffect(() => {
    const fetchAgentName = async () => {
      if (!selectedAgent) {
        setAgentName(undefined);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('name')
          .eq('id', selectedAgent)
          .single();
          
        if (error) {
          console.error('Error fetching agent name:', error);
          return;
        }
        
        if (data) {
          setAgentName(data.name);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    };

    fetchAgentName();
  }, [selectedAgent]);

  const extractLeadFromMessage = async (message: string) => {
    if (!message) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez entrer un message contenant des informations de lead."
      });
      return;
    }

    try {
      // Try to parse it directly first
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
    }
  };

  const handleImportLead = () => {
    if (!selectedAgent) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un commercial à qui assigner ce lead."
      });
      return;
    }

    if (!extractedData) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Aucune donnée de lead n'a été extraite."
      });
      return;
    }

    try {
      // Prepare lead data using essential information from extractedData
      const newLead = {
        name: extractedData.name || "",
        email: extractedData.email || "",
        phone: extractedData.phone || "",
        source: "Le Figaro" as const,
        budget: extractedData.budget || "",
        propertyReference: extractedData.reference || "",
        desiredLocation: extractedData.desiredLocation || "",
        propertyType: (extractedData.propertyType || extractedData.type || "") as PropertyType,
        country: (extractedData.country || "Spain") as Country,
        notes: extractedData.notes || "",
        status: "New" as const,
        tags: ["Imported"],
        assignedTo: selectedAgent,
        assignedToName: agentName,
        taskType: "Call" as TaskType,
        // Only include bedrooms if available
        bedrooms: extractedData.bedrooms
      };
      
      const createdLead = createLead(newLead);
      
      toast({
        title: "Lead importé",
        description: `Le lead ${newLead.name} a été créé avec succès et assigné à ${agentName || 'un commercial'}.`
      });
      
      setShowLeadForm(false);
      setSelectedAgent(undefined);
      
      if (createdLead && createdLead.id) {
        setTimeout(() => {
          navigate(`/leads/${createdLead.id}`);
        }, 500);
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le lead."
      });
    }
  };

  return {
    showLeadForm,
    setShowLeadForm,
    selectedAgent,
    setSelectedAgent,
    extractedData,
    setExtractedData,
    agentName,
    extractLeadFromMessage,
    handleImportLead
  };
};
