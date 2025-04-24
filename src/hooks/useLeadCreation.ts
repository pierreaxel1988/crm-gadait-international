
import { useState, useEffect } from 'react';
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

  // Vérifiez l'authentification de l'utilisateur
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

  // Récupérer les statuts disponibles en fonction du type de pipeline
  const availableStatuses = getStatusesForPipeline(pipelineType);

  // Gérer la soumission du formulaire de lead
  const handleSubmit = async (data: LeadDetailed) => {
    if (isSubmitting) {
      console.log("Submission already in progress, ignoring");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        throw new Error("Vous devez être connecté pour créer un lead.");
      }
      
      console.log("Creating lead with data:", data);
      console.log("Assigned agent:", assignedAgent);
      console.log("Pipeline type:", pipelineType);
      
      const newLeadData = structuredClone(data);
      delete newLeadData.id;
      delete newLeadData.createdAt;
      
      // Logique d'assignation d'agent
      if (isAdmin && assignedAgent) {
        newLeadData.assignedTo = assignedAgent;
        console.log("Admin assigning agent:", assignedAgent);
      } else if (!isAdmin && user) {
        newLeadData.assignedTo = user.id;
        console.log("Commercial self-assigning lead:", user.id);
      } else if (data.assignedTo) {
        // Conserver l'agent sélectionné directement dans le formulaire
        console.log("Using form-selected agent:", data.assignedTo);
      }
      
      // S'assurer que le type de pipeline et le statut sont définis
      newLeadData.pipelineType = pipelineType;
      newLeadData.pipeline_type = pipelineType;
      newLeadData.status = leadStatus;
      
      // Ajouter une entrée dans l'historique des actions si nécessaire
      if (!newLeadData.actionHistory || newLeadData.actionHistory.length === 0) {
        newLeadData.actionHistory = [{
          id: crypto.randomUUID(),
          actionType: 'Creation',
          createdAt: new Date().toISOString(),
          scheduledDate: new Date().toISOString(),
          notes: 'Lead créé avec statut: ' + leadStatus + (newLeadData.assignedTo ? ' et assigné à un agent' : '')
        }];
      }
      
      console.log("Final lead data before submission:", newLeadData);
      
      // Créer le lead avec les données préparées
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
  };

  // Gestion du changement d'agent
  const handleAgentChange = (value: string | undefined) => {
    console.log("Agent changed to:", value);
    setAssignedAgent(value);
  };

  // Gestion du changement de type de pipeline
  const handlePipelineTypeChange = (value: PipelineType) => {
    console.log("Pipeline type changed to:", value);
    setPipelineType(value);
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
    setLeadStatus,
    showDebugInfo,
    setShowDebugInfo
  };
};

export default useLeadCreation;
