
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { createLead } from '@/services/leadCore';
import { LeadDetailed } from '@/types/lead';
import { ExtractedData } from '../types/chatTypes';
import { supabase } from '@/integrations/supabase/client';

export const useLeadCreation = () => {
  const [selectedPipeline, setSelectedPipeline] = useState<'purchase' | 'rental'>('purchase');
  const [selectedAgent, setSelectedAgent] = useState<string | undefined>(undefined);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const navigate = useNavigate();
  
  // Set default agent when form is shown
  useEffect(() => {
    if (showAssignmentForm) {
      fetchPierreAxelId();
    }
  }, [showAssignmentForm]);
  
  const fetchPierreAxelId = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('id')
        .ilike('name', '%pierre axel gadait%')
        .single();
        
      if (error) {
        console.error('Error fetching Pierre Axel Gadait ID:', error);
        return;
      }
      
      if (data && data.id) {
        setSelectedAgent(data.id);
      }
    } catch (error) {
      console.error('Unexpected error fetching Pierre Axel Gadait ID:', error);
    }
  };
  
  const createLeadFromData = async (extractedData: ExtractedData | null, emailContent: string, clearForm: () => void) => {
    if (!extractedData) return;
    
    if (!selectedAgent) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un commercial à qui assigner ce lead."
      });
      return;
    }
    
    try {
      const newLead: Omit<LeadDetailed, "id" | "createdAt"> = {
        name: extractedData.Name || extractedData.name || "",
        email: extractedData.Email || extractedData.email || "",
        phone: extractedData.Phone || extractedData.phone || "",
        source: extractedData.Source || extractedData.source || "Site web",
        budget: extractedData.Budget || extractedData.budget || "",
        propertyReference: extractedData.property_reference || extractedData.reference || extractedData["Property reference"] || "",
        desiredLocation: extractedData.desired_location || extractedData.desiredLocation || extractedData["Desired location"] || "",
        propertyType: extractedData.propertyType || extractedData.property_type || extractedData["Property type"] || "",
        nationality: extractedData.nationality || "",
        notes: emailContent || "",
        status: "New",
        tags: ["Imported"],
        assignedTo: selectedAgent,
        taskType: "Call", // Always assign "Call" task regardless of pipeline
      };
      
      const createdLead = await createLead(newLead);
      
      toast({
        title: "Lead créé",
        description: `Le lead ${newLead.name} a été créé avec succès dans le pipeline ${selectedPipeline === 'purchase' ? 'achat' : 'location'}.`
      });
      
      clearForm();
      
      // Navigate to the lead detail page
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
    selectedPipeline, 
    setSelectedPipeline,
    selectedAgent, 
    setSelectedAgent,
    showAssignmentForm, 
    setShowAssignmentForm,
    createLeadFromData
  };
};
