import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import LeadForm from '@/components/leads/LeadForm';
import { LeadDetailed } from '@/types/lead';
import { createLead } from '@/services/leadService';
import CustomButton from '@/components/ui/CustomButton';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import TeamMemberSelect from '@/components/leads/TeamMemberSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { LeadStatus } from '@/components/common/StatusBadge';

const LeadNew = () => {
  const navigate = useNavigate();
  const { isAdmin, user, session } = useAuth();
  const [assignedAgent, setAssignedAgent] = useState<string | undefined>(undefined);
  const [pipelineType, setPipelineType] = useState<'purchase' | 'rental'>('purchase');
  const [leadStatus, setLeadStatus] = useState<LeadStatus>('New');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vérifier l'authentification avant de permettre la création de lead
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

  const handleSubmit = async (data: LeadDetailed) => {
    if (isSubmitting) {
      console.log("Submission already in progress, ignoring");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    console.log("Starting lead creation process...");
    
    try {
      // Vérifier à nouveau l'authentification
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
      newLeadData.status = leadStatus;
      
      console.log("Creating lead with processed data:", newLeadData);
      
      // Create the lead
      const createdLead = await createLead(newLeadData);
      
      if (createdLead) {
        console.log("Lead created successfully:", createdLead);
        toast({
          title: "Lead créé",
          description: assignedAgent 
            ? "Le lead a été créé et attribué avec succès."
            : "Le lead a été créé avec succès."
        });
        
        // Redirect to the pipeline page with the correct tab
        navigate(`/pipeline?tab=${pipelineType}`);
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

  // Handle agent selection and sync with form data
  const handleAgentChange = (value: string | undefined) => {
    console.log("Agent changed to:", value);
    setAssignedAgent(value);
  };

  // Define available statuses for the lead, matching those used in the pipeline
  // This ensures consistency between lead creation and pipeline display
  const purchaseStatuses: LeadStatus[] = [
    'New', 'Contacted', 'Qualified', 'Visit', 'Proposal', 'Offer', 'Deposit', 'Signed', 'Gagné', 'Perdu'
  ];
  
  const rentalStatuses: LeadStatus[] = [
    'New', 'Contacted', 'Qualified', 'Visit', 'Proposal', 'Offre', 'Deposit', 'Signed', 'Gagné', 'Perdu'
  ];
  
  // Use the appropriate statuses based on the selected pipeline type
  const availableStatuses = pipelineType === 'purchase' ? purchaseStatuses : rentalStatuses;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-2">
        <CustomButton 
          variant="outline" 
          onClick={() => navigate('/leads')}
          className="w-auto p-2 rounded border-chocolate-light text-chocolate-dark hover:bg-chocolate-light/10"
        >
          <ArrowLeft className="h-4 w-4" />
        </CustomButton>
        <div>
          <h1 className="text-2xl md:text-3xl font-futura text-loro-navy">Nouveau Lead</h1>
          <p className="text-chocolate-dark font-futuraLight">Ajouter un nouveau lead dans le système</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-100 border-red-400">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isAdmin && (
        <div className="luxury-card p-4 border-loro-sand">
          <h2 className="text-lg font-medium mb-4">Attribution du lead</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Type de pipeline</label>
              <Select
                value={pipelineType}
                onValueChange={(value: 'purchase' | 'rental') => {
                  setPipelineType(value);
                  // Reset status to 'New' when pipeline type changes
                  setLeadStatus('New');
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un pipeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">Achat</SelectItem>
                  <SelectItem value="rental">Location</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Statut initial</label>
              <Select
                value={leadStatus}
                onValueChange={(value: LeadStatus) => setLeadStatus(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  {availableStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <TeamMemberSelect
              value={assignedAgent}
              onChange={handleAgentChange}
              label="Attribuer ce lead à"
              autoSelectPierreAxel={true}
            />
          </div>
        </div>
      )}

      <div className="luxury-card p-6 border-loro-sand">
        <LeadForm 
          onSubmit={handleSubmit} 
          onCancel={() => navigate('/leads')}
          adminAssignedAgent={assignedAgent}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default LeadNew;
