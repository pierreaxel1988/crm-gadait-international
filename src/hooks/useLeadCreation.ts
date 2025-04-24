
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
  const [currentUserTeamId, setCurrentUserTeamId] = useState<string | undefined>(undefined);

  // Récupérer les informations de l'utilisateur courant
  useEffect(() => {
    const fetchCurrentUserTeamId = async () => {
      if (!user?.email) return;
      
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('id')
          .eq('email', user.email)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setCurrentUserTeamId(data.id);
          if (!isAdmin) {
            setAssignedAgent(data.id);
          }
        }
      } catch (error) {
        console.error("Error fetching current user team ID:", error);
      }
    };
    
    fetchCurrentUserTeamId();
  }, [user, isAdmin]);

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

  const handleSubmit = useCallback(async (data: LeadDetailed) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        throw new Error("Vous devez être connecté pour créer un lead.");
      }
      
      const newLeadData = structuredClone(data);
      delete newLeadData.id;
      delete newLeadData.createdAt;
      
      // Assignation basée sur les rôles et permissions
      if (!isAdmin && currentUserTeamId) {
        // Les commerciaux sont toujours auto-assignés
        newLeadData.assignedTo = currentUserTeamId;
        if (data.assignedTo && data.assignedTo !== currentUserTeamId) {
          toast({
            variant: "destructive",
            title: "Attribution automatique",
            description: "En tant que commercial, le lead a été automatiquement assigné à vous-même."
          });
        }
      } else if (isAdmin) {
        // Les admins peuvent assigner à n'importe qui
        newLeadData.assignedTo = data.assignedTo || assignedAgent;
      }
      
      newLeadData.pipelineType = pipelineType;
      newLeadData.pipeline_type = pipelineType;
      newLeadData.status = leadStatus;
      
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
  }, [assignedAgent, isAdmin, isSubmitting, leadStatus, navigate, pipelineType, currentUserTeamId]);

  const handleAgentChange = useCallback((value: string | undefined) => {
    if (!isAdmin && currentUserTeamId) {
      return; // Les commerciaux ne peuvent pas changer l'assignation
    }
    setAssignedAgent(value);
  }, [isAdmin, currentUserTeamId]);

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
    currentUserTeamId,
    isAdmin
  };
};

export default useLeadCreation;
