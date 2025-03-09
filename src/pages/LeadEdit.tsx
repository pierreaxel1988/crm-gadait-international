
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import LeadForm from '@/components/leads/LeadForm';
import { LeadDetailed } from '@/types/lead';
import { getLead, updateLead, deleteLead } from '@/services/leadService';
import CustomButton from '@/components/ui/CustomButton';
import { toast } from '@/hooks/use-toast';

const LeadEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<LeadDetailed | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      try {
        const leadData = getLead(id);
        setLead(leadData);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les informations du lead."
        });
      } finally {
        setIsLoading(false);
      }
    }
  }, [id]);

  const handleSubmit = (data: LeadDetailed) => {
    try {
      updateLead(data);
      navigate('/leads');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'enregistrer les modifications."
      });
    }
  };

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce lead ?')) {
      try {
        if (id) {
          deleteLead(id);
          navigate('/leads');
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de supprimer ce lead."
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!lead && id) {
    return (
      <div className="p-6">
        <div className="text-center py-10">
          <h2 className="text-2xl font-semibold">Lead introuvable</h2>
          <p className="text-muted-foreground mt-2">Le lead que vous recherchez n'existe pas.</p>
          <CustomButton 
            className="mt-4" 
            onClick={() => navigate('/leads')}
          >
            Retour à la liste
          </CustomButton>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CustomButton 
            variant="outline" 
            onClick={() => navigate('/leads')}
            className="w-auto p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </CustomButton>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">
              {lead ? `Modifier ${lead.name}` : 'Nouveau Lead'}
            </h1>
            <p className="text-muted-foreground">
              {lead ? 'Modifier les informations du lead' : 'Ajouter un nouveau lead'}
            </p>
          </div>
        </div>
        {lead && (
          <CustomButton 
            variant="outline" 
            onClick={handleDelete}
            className="w-auto p-2 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
          >
            <Trash2 className="h-4 w-4" />
          </CustomButton>
        )}
      </div>

      <div className="luxury-card p-6">
        <LeadForm 
          lead={lead} 
          onSubmit={handleSubmit} 
          onCancel={() => navigate('/leads')}
        />
      </div>
    </div>
  );
};

export default LeadEdit;
