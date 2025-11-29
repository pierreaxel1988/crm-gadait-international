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

  const availableStatuses = getStatusesForPipeline(pipelineType);

  const handleSubmit = async (data: LeadDetailed) => {
    if (isSubmitting) {
      console.log("Submission already in progress, ignoring");
      return;
    }
    
    console.log("=== DÉBUT CRÉATION LEAD ===");
    console.log("1. Données reçues:", data);
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        throw new Error("Vous devez être connecté pour créer un lead.");
      }
      
      console.log("2. Session valide, utilisateur:", authData.session.user.email);
      
      const newLeadData = structuredClone(data);
      delete newLeadData.id;
      delete newLeadData.createdAt;
      
      console.log("3. Données après nettoyage:", newLeadData);
      
      if (isAdmin && assignedAgent) {
        newLeadData.assignedTo = assignedAgent;
      } else if (!isAdmin && user) {
        // Pour les agents non-admin, récupérer l'ID team_member basé sur l'email
        const { data: teamMember } = await supabase
          .from('team_members')
          .select('id')
          .eq('email', user.email)
          .single();
        
        if (teamMember) {
          newLeadData.assignedTo = teamMember.id;
          console.log(`Agent auto-assigné: ${teamMember.id}`);
        } else {
          console.warn(`Aucun team_member trouvé pour l'email: ${user.email}`);
        }
      }
      
      newLeadData.pipelineType = pipelineType;
      newLeadData.pipeline_type = pipelineType;
      newLeadData.status = leadStatus;
      
      console.log("4. Pipeline et statut configurés:", { 
        pipelineType: newLeadData.pipelineType, 
        pipeline_type: newLeadData.pipeline_type,
        status: newLeadData.status,
        assignedTo: newLeadData.assignedTo
      });
      
      if (!newLeadData.actionHistory || newLeadData.actionHistory.length === 0) {
        newLeadData.actionHistory = [{
          id: crypto.randomUUID(),
          actionType: 'Creation',
          createdAt: new Date().toISOString(),
          scheduledDate: new Date().toISOString(),
          notes: 'Lead créé avec statut: ' + leadStatus + (newLeadData.assignedTo ? ' et assigné à un agent' : '')
        }];
      }
      
      console.log("5. Appel createLead avec données finales:", newLeadData);
      const createdLead = await createLead(newLeadData);
      console.log("6. Lead créé avec succès:", createdLead);
      
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
      console.error("=== ERREUR CRÉATION LEAD ===");
      console.error("Type d'erreur:", error);
      console.error("Message:", error instanceof Error ? error.message : "Erreur inconnue");
      console.error("Stack:", error instanceof Error ? error.stack : "N/A");
      
      setError(error instanceof Error ? error.message : "Une erreur inconnue est survenue");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le nouveau lead. Veuillez réessayer."
      });
    } finally {
      console.log("=== FIN CRÉATION LEAD ===");
      setIsSubmitting(false);
    }
  };

  const handleAgentChange = (value: string | undefined) => {
    console.log("Agent changed to:", value);
    setAssignedAgent(value);
  };

  const handlePipelineTypeChange = (value: PipelineType) => {
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
