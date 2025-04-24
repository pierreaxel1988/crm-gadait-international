
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LeadDetailed, LeadStatus, PipelineType } from '@/types/lead';
import { createLead } from '@/services/leadService';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getStatusesForPipeline } from '@/utils/pipelineUtils';

export const useLeadCreation = () => {
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const pipelineFromUrl = queryParams.get('pipeline') as PipelineType | null;
  const statusFromUrl = queryParams.get('status') as LeadStatus | null;
  
  const [assignedAgent, setAssignedAgent] = useState<string | undefined>(undefined);
  const [pipelineType, setPipelineType] = useState<PipelineType>(pipelineFromUrl || 'purchase');
  const [leadStatus, setLeadStatus] = useState<LeadStatus>(statusFromUrl || 'New');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Utilisez useEffect pour les effets secondaires liés à l'authentification
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

  // Utilisez useEffect séparé pour la journalisation de l'agent
  useEffect(() => {
    console.log("Current assigned agent in useLeadCreation:", assignedAgent);
  }, [assignedAgent]);

  const availableStatuses = getStatusesForPipeline(pipelineType);

  // Utilisez useCallback pour la fonction handleSubmit pour éviter les recréations inutiles
  const handleSubmit = useCallback(async (data: LeadDetailed) => {
    if (isSubmitting) {
      console.log("Submission already in progress, ignoring");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log("Submitting lead data:", data);
      console.log("Current assigned agent:", assignedAgent);
      console.log("Is admin:", isAdmin);
      console.log("Current user:", user);
      
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        throw new Error("Vous devez être connecté pour créer un lead.");
      }
      
      const newLeadData = structuredClone(data);
      delete newLeadData.id;
      delete newLeadData.createdAt;
      
      // Assignation de l'agent
      if (data.assignedTo) {
        console.log("Using form's assignedTo:", data.assignedTo);
        newLeadData.assignedTo = data.assignedTo;
      } else if (isAdmin && assignedAgent) {
        console.log("Using admin's assignedTo:", assignedAgent);
        newLeadData.assignedTo = assignedAgent;
      } else if (!isAdmin && user) {
        console.log("Using current user as assignedTo:", user.id);
        newLeadData.assignedTo = user.id;
      }
      
      newLeadData.pipelineType = pipelineType;
      newLeadData.pipeline_type = pipelineType;
      newLeadData.status = leadStatus;
      
      console.log("Final lead data to submit:", newLeadData);
      
      if (!newLeadData.actionHistory || newLeadData.actionHistory.length === 0) {
        newLeadData.actionHistory = [{
          id: crypto.randomUUID(),
          actionType: 'Creation',
          createdAt: new Date().toISOString(),
          scheduledDate: new Date().toISOString(),
          notes: 'Lead créé avec statut: ' + leadStatus + (newLeadData.assignedTo ? ' et assigné à un agent' : '')
        }];
      }
      
      const createdLead = await createLead(newLeadData);
      
      if (createdLead) {
        let successMessage = "Le lead a été créé avec succès.";
        if (createdLead.assignedTo) {
          const { data: agentData } = await supabase
            .from("team_members")
            .select("name")
            .eq("id", createdLead.assignedTo)
            .single();
            
          if (agentData) {
            successMessage = `Le lead a été créé et attribué à ${agentData.name} avec succès.`;
          }
        }
        
        toast({
          title: "Lead créé",
          description: successMessage
        });
        
        navigate(`/leads/${createdLead.id}?tab=info`);
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
  }, [assignedAgent, isAdmin, isSubmitting, leadStatus, navigate, pipelineType, user]);

  const handleAgentChange = useCallback((value: string | undefined) => {
    console.log("Agent changed to:", value);
    setAssignedAgent(value);
  }, []);

  const handlePipelineTypeChange = useCallback((value: PipelineType) => {
    setPipelineType(value);
    if (!statusFromUrl) {
      setLeadStatus('New');
    }
  }, [statusFromUrl]);

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
    setLeadStatus,
    showDebugInfo,
    setShowDebugInfo
  };
};

export default useLeadCreation;
