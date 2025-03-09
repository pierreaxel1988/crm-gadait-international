
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import LeadForm from '@/components/leads/LeadForm';
import { LeadDetailed } from '@/types/lead';
import { createLead } from '@/services/leadService';
import CustomButton from '@/components/ui/CustomButton';
import { toast } from '@/hooks/use-toast';

const LeadNew = () => {
  const navigate = useNavigate();

  const handleSubmit = (data: LeadDetailed) => {
    try {
      const { id, createdAt, ...newLeadData } = data;
      createLead(newLeadData);
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
          className="w-auto p-2 border-loro-sand text-loro-hazel hover:bg-loro-sand/50"
        >
          <ArrowLeft className="h-4 w-4" />
        </CustomButton>
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-loro-navy">Nouveau Lead</h1>
          <p className="text-loro-hazel">Ajouter un nouveau lead dans le système</p>
        </div>
      </div>

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
