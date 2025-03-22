
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

const LeadNew = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [assignedAgent, setAssignedAgent] = useState<string | undefined>(undefined);
  const [autoCreatingLead, setAutoCreatingLead] = useState<boolean>(true);

  // Automatically create lead from Idealista message
  useEffect(() => {
    if (autoCreatingLead) {
      setAutoCreatingLead(false);
      
      // Create a lead for the Idealista message with the given data
      const createIdealitaLead = async () => {
        const idealitaLead: Omit<LeadDetailed, "id" | "createdAt"> = {
          name: "Fatiha",
          email: "fmohamed01@cuatrocaminos.net",
          phone: "644 15 78 61",
          source: "Idealista",
          propertyReference: "85719297",
          budget: "30.000.000",
          currency: "EUR",
          country: "Spain",
          desiredLocation: "La Zagaleta, Benahavis",
          propertyType: "Villa",
          notes: "Hola necesito contactar contigo en whatsapp para saber mas detalles de esta casa si no te importa gracias.",
          status: "New",
          tags: ["Imported"],
          pipelineType: "purchase" // Explicitly set the pipeline type to purchase
        };
        
        try {
          const createdLead = await createLead(idealitaLead);
          
          toast({
            title: "Lead créé",
            description: "Le lead a été créé et attribué à Pierre Axel Gadait avec succès."
          });
          
          // Navigate to the lead detail page
          if (createdLead && createdLead.id) {
            navigate(`/leads/${createdLead.id}`);
          }
        } catch (error) {
          console.error('Error creating lead:', error);
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de créer le lead automatiquement. Veuillez le créer manuellement."
          });
        }
      };
      
      createIdealitaLead();
    }
  }, [autoCreatingLead, navigate]);

  const handleSubmit = (data: LeadDetailed) => {
    try {
      // Si l'utilisateur est admin et a sélectionné un commercial
      if (isAdmin && assignedAgent) {
        data.assignedTo = assignedAgent;
      }
      
      const { id, createdAt, ...newLeadData } = data;
      
      // Ensure pipelineType is set if not already defined
      if (!newLeadData.pipelineType) {
        newLeadData.pipelineType = 'purchase';
      }
      
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
          <h1 className="text-2xl md:text-3xl font-futuraMd text-loro-navy">Nouveau Lead</h1>
          <p className="text-loro-hazel">Ajouter un nouveau lead dans le système</p>
        </div>
      </div>

      {isAdmin && (
        <div className="luxury-card p-4 border-loro-sand">
          <h2 className="text-lg font-medium mb-4">Attribution du lead</h2>
          <TeamMemberSelect
            value={assignedAgent}
            onChange={handleAgentChange}
            label="Attribuer ce lead à"
            autoSelectPierreAxel={true}
          />
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
