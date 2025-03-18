
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

const LeadNew = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [assignedAgent, setAssignedAgent] = useState<string | undefined>(undefined);

  const handleSubmit = (data: LeadDetailed) => {
    try {
      // Si l'utilisateur est admin et a sélectionné un commercial
      if (isAdmin && assignedAgent) {
        data.assignedTo = assignedAgent;
      }
      
      const { id, createdAt, ...newLeadData } = data;
      createLead(newLeadData);
      
      toast({
        title: "Lead créé",
        description: assignedAgent 
          ? "Le lead a été créé et attribué avec succès."
          : "Le lead a été créé avec succès."
      });
      
      navigate('/leads');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le nouveau lead."
      });
    }
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
          <h1 className="text-2xl md:text-3xl font-semibold text-loro-navy">Nouveau Lead</h1>
          <p className="text-loro-hazel">Ajouter un nouveau lead dans le système</p>
        </div>
      </div>

      {isAdmin && (
        <div className="luxury-card p-4 border-loro-sand">
          <h2 className="text-lg font-medium mb-4">Attribution du lead</h2>
          <TeamMemberSelect
            value={assignedAgent}
            onChange={(value) => setAssignedAgent(value)}
            label="Attribuer ce lead à"
          />
        </div>
      )}

      <div className="luxury-card p-6 border-loro-sand">
        <LeadForm 
          onSubmit={handleSubmit} 
          onCancel={() => navigate('/leads')}
        />
      </div>
    </div>
  );
};

export default LeadNew;
