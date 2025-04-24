
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
          console.log("Current team member ID set to:", data.id);
          
          // Auto-assigner au commercial si ce n'est pas un admin
          if (!isAdmin) {
            setAssignedAgent(data.id);
            console.log("Auto-assigned to current non-admin user:", data.id);
          }
        }
      } catch (error) {
        console.error("Error fetching current user team ID:", error);
      }
    };
    
    fetchCurrentUserTeamId();
  }, [user, isAdmin]);

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
      
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        throw new Error("Vous devez être connecté pour créer un lead.");
      }
      
      const newLeadData = structuredClone(data);
      delete newLeadData.id;
      delete newLeadData.createdAt;
      
      // Assignation de l'agent
      // Si c'est un commercial et qu'il essaie d'assigner à quelqu'un d'autre, bloquer
      if (!isAdmin && data.assignedTo && data.assignedTo !== currentUserTeamId) {
        console.log("Non-admin trying to assign to someone else. Redirecting to self:", currentUserTeamId);
        toast({
          variant: "destructive", 
          title: "Attribution automatique",
          description: "En tant que commercial, le lead a été automatiquement assigné à vous-même."
        });
        newLeadData.assignedTo = currentUserTeamId;
      } 
      // Sinon utiliser la logique normale d'assignation
      else if (data.assignedTo) {
        console.log("Using form's assignedTo:", data.assignedTo);
        newLeadData.assignedTo = data.assignedTo;
      } else if (isAdmin && assignedAgent) {
        console.log("Using admin's assignedTo:", assignedAgent);
        newLeadData.assignedTo = assignedAgent;
      } else if (!isAdmin && currentUserTeamId) {
        console.log("Using current user as assignedTo:", currentUserTeamId);
        newLeadData.assignedTo = currentUserTeamId;
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
        navigate(`/leads/${createdLead.id}?tab=info`);
      } else {
        throw new Error("Aucune donnée de lead retournée après création");
      }
    } catch (error) {
      console.error("Error creating lead:", error);
      
      // Essayer de détecter si c'est une erreur RLS
      if (error instanceof Error && 
          (error.message.includes("violates row-level security") || 
           error.message.includes("new row violates"))) {
        setError("Vous n'avez pas les permissions nécessaires pour créer ce lead avec cette assignation.");
      } else {
        setError(error instanceof Error ? error.message : "Une erreur inconnue est survenue");
      }
      
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
    console.log("Agent changed to:", value);
    
    // Si l'utilisateur n'est pas admin, on force l'assignation à lui-même
    if (!isAdmin && currentUserTeamId && value !== currentUserTeamId) {
      console.log("Non-admin trying to change agent. Ignoring and keeping self-assignment.");
      return;
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
