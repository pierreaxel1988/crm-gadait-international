
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { createLead } from '@/services/leadService';
import { LeadDetailed } from '@/types/lead';
import { ExtractedData, TeamMember } from '../types/chatTypes';

export const useEmailExtraction = () => {
  const [emailContent, setEmailContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [selectedPipeline, setSelectedPipeline] = useState<'purchase' | 'rental'>('purchase');
  const [selectedAgent, setSelectedAgent] = useState<string | undefined>(undefined);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('id, name')
          .order('name');

        if (error) {
          console.error('Error fetching team members:', error);
          return;
        }

        if (data) {
          setTeamMembers(data);
        }
      } catch (error) {
        console.error('Unexpected error fetching team members:', error);
      }
    };

    fetchTeamMembers();
  }, []);

  const extractEmailData = async () => {
    if (!emailContent.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez coller le contenu d'un email."
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-gadait', {
        body: { type: 'email-extract', content: emailContent }
      });

      if (error) {
        throw new Error(error.message);
      }

      try {
        const jsonData = JSON.parse(data.response);
        setExtractedData(jsonData);
        
        toast({
          title: "Données extraites",
          description: "Les informations ont été extraites avec succès."
        });
      } catch (parseError) {
        setExtractedData({ raw: data.response });
        toast({
          variant: "destructive",
          title: "Format incorrect",
          description: "Les données n'ont pas pu être traitées correctement."
        });
      }
    } catch (error) {
      console.error('Error extracting email data:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'extraire les données de l'email."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createLeadFromData = () => {
    if (!extractedData) return;
    
    try {
      const newLead: Omit<LeadDetailed, "id" | "createdAt"> = {
        name: extractedData.Name || extractedData.name || "",
        email: extractedData.Email || extractedData.email || "",
        phone: extractedData.Phone || extractedData.phone || "",
        source: extractedData.Source || extractedData.source || "Site web",
        budget: extractedData.Budget || extractedData.budget || "",
        propertyReference: extractedData.property_reference || extractedData["Property reference"] || "",
        desiredLocation: extractedData.desired_location || extractedData["Desired location"] || "",
        propertyType: extractedData.property_type || extractedData["Property type"] || "",
        notes: emailContent || "",
        status: "New",
        tags: ["Imported"],
        assignedTo: selectedAgent,
        taskType: "Call",
      };
      
      createLead(newLead);
      
      toast({
        title: "Lead créé",
        description: `Le lead ${newLead.name} a été créé avec succès dans le pipeline ${selectedPipeline === 'purchase' ? 'achat' : 'location'}.`
      });
      
      setEmailContent("");
      setExtractedData(null);
      setSelectedAgent(undefined);
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
    emailContent,
    setEmailContent,
    isLoading,
    extractedData,
    selectedPipeline,
    setSelectedPipeline,
    selectedAgent,
    setSelectedAgent,
    teamMembers,
    extractEmailData,
    createLeadFromData
  };
};
