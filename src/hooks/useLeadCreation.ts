
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LeadDetailed, LeadStatus } from '@/types/lead';
import { createLead } from '@/services/leadService';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useLeadCreation = () => {
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  // Get pipeline type and status from URL if available
  const pipelineFromUrl = queryParams.get('pipeline') as 'purchase' | 'rental' | null;
  const statusFromUrl = queryParams.get('status') as LeadStatus | null;
  
  const [assignedAgent, setAssignedAgent] = useState<string | undefined>(undefined);
  const [pipelineType, setPipelineType] = useState<'purchase' | 'rental'>(pipelineFromUrl || 'purchase');
  const [leadStatus, setLeadStatus] = useState<LeadStatus>(statusFromUrl || 'New');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check authentication before allowing lead creation
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({
          variant: "destructive",
          title: "Accès refusé",
          description: "Vous devez être connecté pour créer un lead."
        });
        navigate('/auth');
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Define available statuses for the lead
  const purchaseStatuses: LeadStatus[] = [
    'New', 'Contacted', 'Qualified', 'Visit', 'Proposal', 'Offer', 'Deposit', 'Signed', 'Gagné', 'Perdu'
  ];
  
  const rentalStatuses: LeadStatus[] = [
    'New', 'Contacted', 'Qualified', 'Visit', 'Proposal', 'Offre', 'Deposit', 'Signed', 'Gagné', 'Perdu'
  ];
  
  // Use the appropriate statuses based on the selected pipeline type
  const availableStatuses = pipelineType === 'purchase' ? purchaseStatuses : rentalStatuses;

  const handleSubmit = async (data: LeadDetailed) => {
    if (isSubmitting) {
      console.log("Submission already in progress, ignoring");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    console.log("Starting lead creation process...");
    
    try {
      // Verify authentication again
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        throw new Error("Vous devez être connecté pour créer un lead.");
      }
      
      // Deep copy to avoid modifying the original data
      const newLeadData = structuredClone(data);
      delete newLeadData.id;
      delete newLeadData.createdAt;
      
      // Handle assignment based on user role
      if (isAdmin && assignedAgent) {
        console.log("Admin assigning lead to:", assignedAgent);
        newLeadData.assignedTo = assignedAgent;
      } else if (!isAdmin && user) {
        console.log("Non-admin user, self-assigning lead to:", user.id);
        newLeadData.assignedTo = user.id;
      }
      
      // Explicitly set pipeline type in both fields for database compatibility
      newLeadData.pipelineType = pipelineType;
      newLeadData.pipeline_type = pipelineType;
      
      // Set the selected status
      console.log("Setting lead status to:", leadStatus);
      newLeadData.status = leadStatus;
      
      // Add initial action to history if not present
      if (!newLeadData.actionHistory || newLeadData.actionHistory.length === 0) {
        newLeadData.actionHistory = [{
          id: crypto.randomUUID(),
          actionType: 'Creation',
          createdAt: new Date().toISOString(),
          scheduledDate: new Date().toISOString(),
          notes: 'Lead créé avec statut: ' + leadStatus + (newLeadData.assignedTo ? ' et assigné à un agent' : '')
        }];
      }
      
      console.log("Creating lead with processed data:", newLeadData);
      
      // Create the lead
      const createdLead = await createLead(newLeadData);
      
      if (createdLead) {
        console.log("Lead created successfully:", createdLead);
        toast({
          title: "Lead créé",
          description: assignedAgent 
            ? `Le lead a été créé et attribué à un agent avec succès.`
            : "Le lead a été créé avec succès."
        });
        
        // Navigate to the lead detail page
        navigate(`/leads/${createdLead.id}`);
      } else {
        throw new Error("Aucune donnée de lead retournée après création");
      }
    } catch (error) {
      console.error("Error creating lead:", error);
      setError(error instanceof Error ? error.message : "Une erreur inconnue est survenue");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le nouveau lead. Veuillez réessayer."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle agent selection
  const handleAgentChange = (value: string | undefined) => {
    console.log("Agent changed to:", value);
    setAssignedAgent(value);
  };

  // Handle pipeline type change
  const handlePipelineTypeChange = (value: 'purchase' | 'rental') => {
    setPipelineType(value);
    // Reset status to 'New' when pipeline type changes only if status wasn't explicitly set
    if (!statusFromUrl) {
      setLeadStatus('New');
    }
  };

  return {
    assignedAgent,
    pipelineType,
    leadStatus,
    isSubmitting,
    error,
    availableStatuses,
    handleSubmit,
    handleAgentChange,
    handlePipelineTypeChange,
    setLeadStatus
  };
};
