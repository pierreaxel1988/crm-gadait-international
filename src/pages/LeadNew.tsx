
import React, { useState } from 'react';
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

const LeadNew = () => {
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const [assignedAgent, setAssignedAgent] = useState<string | undefined>(undefined);
  const [pipelineType, setPipelineType] = useState<'purchase' | 'rental'>('purchase');

  const handleSubmit = (data: LeadDetailed) => {
    try {
      // Deep copy to avoid modifying the original data
      const newLeadData = JSON.parse(JSON.stringify(data));
      delete newLeadData.id;
      delete newLeadData.createdAt;
      
      // If user is admin and has selected a commercial
      if (isAdmin && assignedAgent) {
        newLeadData.assignedTo = assignedAgent;
      } else if (!isAdmin && user) {
        // If not admin and user is logged in, assign to themselves
        newLeadData.assignedTo = user.id;
      }
      
      // Ensure pipeline type is properly set in both fields
      newLeadData.pipelineType = pipelineType;
      newLeadData.pipeline_type = pipelineType; // For database compatibility
      
      console.log("Creating lead with data:", newLeadData);
      
      // Create the lead
      createLead(newLeadData)
        .then((createdLead) => {
          if (createdLead) {
            toast({
              title: "Lead créé",
              description: assignedAgent 
                ? "Le lead a été créé et attribué avec succès."
                : "Le lead a été créé avec succès."
            });
            
            // Redirect to the pipeline page with the correct tab
            navigate(`/pipeline?tab=${pipelineType}`);
          } else {
            throw new Error("No lead data returned");
          }
        })
        .catch((error) => {
          console.error("Erreur lors de la création du lead:", error);
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de créer le nouveau lead. Veuillez réessayer."
          });
        });
    } catch (error) {
      console.error("Exception in handleSubmit:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le nouveau lead. Veuillez réessayer."
      });
    }
  };

  // Handle agent selection and sync with form data
  const handleAgentChange = (value: string | undefined) => {
    setAssignedAgent(value);
  };

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

      {isAdmin && (
        <div className="luxury-card p-4 border-loro-sand">
          <h2 className="text-lg font-medium mb-4">Attribution du lead</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Type de pipeline</label>
              <Select
                value={pipelineType}
                onValueChange={(value: 'purchase' | 'rental') => setPipelineType(value)}
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
        />
      </div>
    </div>
  );
};

export default LeadNew;
