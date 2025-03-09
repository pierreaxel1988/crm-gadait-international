
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus } from 'lucide-react';
import LeadForm from '@/components/leads/LeadForm';
import { LeadDetailed } from '@/types/lead';
import { getLead, updateLead, deleteLead } from '@/services/leadService';
import CustomButton from '@/components/ui/CustomButton';
import { toast } from '@/hooks/use-toast';
import { TaskType } from '@/components/kanban/KanbanCard';
import FloatingActionButtons from '@/components/ui/FloatingActionButtons';

const LeadEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<LeadDetailed | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
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

  const handleAddAction = () => {
    // Afficher un dialogue pour choisir le type d'action
    setIsActionDialogOpen(true);
  };

  const handleActionSelect = (actionType: TaskType) => {
    if (lead && id) {
      try {
        // Mettre à jour le lead avec la nouvelle action
        const updatedLead = { ...lead, taskType: actionType };
        updateLead(updatedLead);
        setLead(updatedLead);
        toast({
          title: "Action ajoutée",
          description: `${actionType} a été ajouté à ${lead.name}`
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'ajouter l'action."
        });
      } finally {
        setIsActionDialogOpen(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin h-8 w-8 border-4 border-chocolate-dark rounded-full border-t-transparent"></div>
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
            variant="chocolate" 
            onClick={() => navigate('/leads')}
          >
            Retour à la liste
          </CustomButton>
        </div>
      </div>
    );
  }

  // Les types d'actions disponibles
  const actionTypes: TaskType[] = [
    'Call',
    'Visites',
    'Compromis',
    'Acte de vente',
    'Contrat de Location',
    'Propositions',
    'Follow up',
    'Estimation',
    'Prospection',
    'Admin'
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CustomButton 
            variant="outline" 
            onClick={() => navigate('/leads')}
            className="w-auto p-2 rounded border-chocolate-light text-chocolate-dark hover:bg-chocolate-light/10"
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
        <div className="flex items-center gap-2">
          {lead && (
            <CustomButton 
              variant="outline" 
              onClick={handleDelete}
              className="w-auto p-2 rounded text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
            >
              <Trash2 className="h-4 w-4" />
            </CustomButton>
          )}
        </div>
      </div>

      {/* Modal/Popup pour sélectionner le type d'action */}
      {isActionDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Sélectionner une action</h2>
            <div className="grid grid-cols-2 gap-2">
              {actionTypes.map((actionType) => (
                <CustomButton
                  key={actionType}
                  variant="outline"
                  className="justify-start text-left py-2"
                  onClick={() => handleActionSelect(actionType)}
                >
                  {actionType}
                </CustomButton>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <CustomButton
                variant="outline"
                onClick={() => setIsActionDialogOpen(false)}
                className="mr-2"
              >
                Annuler
              </CustomButton>
            </div>
          </div>
        </div>
      )}

      <div className="luxury-card p-6">
        <LeadForm 
          lead={lead} 
          onSubmit={handleSubmit} 
          onCancel={() => navigate('/leads')}
        />
      </div>

      {/* Floating action buttons that are always visible while scrolling */}
      {lead && (
        <FloatingActionButtons 
          onAddAction={handleAddAction}
          phoneNumber={lead.phone}
          email={lead.email}
        />
      )}
    </div>
  );
};

export default LeadEdit;
