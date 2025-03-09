
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Trash2, Plus, CalendarClock, Banknote, 
  MapPin, Building2, Building, Flag, HelpCircle, 
  User, Mail, Phone, Globe, Tag, Clipboard
} from 'lucide-react';
import { format } from 'date-fns';
import LeadForm from '@/components/leads/LeadForm';
import { LeadDetailed } from '@/types/lead';
import { getLead, updateLead, deleteLead, addActionToLead } from '@/services/leadService';
import CustomButton from '@/components/ui/CustomButton';
import { toast } from '@/hooks/use-toast';
import { TaskType } from '@/components/kanban/KanbanCard';
import FloatingActionButtons from '@/components/ui/FloatingActionButtons';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import TagBadge from '@/components/common/TagBadge';

const LeadEdit = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const [lead, setLead] = useState<LeadDetailed | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<TaskType | null>(null);
  const [actionDate, setActionDate] = useState<Date | undefined>(undefined);
  const [actionTime, setActionTime] = useState<string>('12:00');
  const [actionNotes, setActionNotes] = useState<string>('');
  const [activeTab, setActiveTab] = useState('informations');
  const isMobile = useIsMobile();
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
    setSelectedAction(null);
    setActionDate(undefined);
    setActionTime('12:00');
    setActionNotes('');
    setIsActionDialogOpen(true);
  };

  const handleActionSelect = (actionType: TaskType) => {
    setSelectedAction(actionType);
  };

  const handleActionConfirm = () => {
    if (lead && id && selectedAction) {
      try {
        let scheduledDateTime = undefined;
        if (actionDate) {
          const [hours, minutes] = actionTime.split(':').map(part => parseInt(part, 10));
          const dateTime = new Date(actionDate);
          dateTime.setHours(hours, minutes);
          scheduledDateTime = dateTime.toISOString();
        }
        
        const updatedLead = addActionToLead(id, {
          actionType: selectedAction,
          scheduledDate: scheduledDateTime,
          notes: actionNotes
        });
        
        if (updatedLead) {
          setLead(updatedLead);
          toast({
            title: "Action ajoutée",
            description: `${selectedAction} a été ajouté à ${lead.name}${
              scheduledDateTime ? ` pour le ${format(new Date(scheduledDateTime), 'dd/MM/yyyy à HH:mm')}` : ''
            }`
          });
        }
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

  const markActionComplete = (actionId: string) => {
    if (lead && id) {
      try {
        // Find the action in history
        const actionHistory = [...(lead.actionHistory || [])];
        const actionIndex = actionHistory.findIndex(action => action.id === actionId);
        
        if (actionIndex !== -1) {
          // Update the action to completed
          actionHistory[actionIndex] = {
            ...actionHistory[actionIndex],
            completedDate: new Date().toISOString()
          };
          
          // Update the lead with the modified action history
          const updatedLead = updateLead({
            ...lead,
            actionHistory
          });
          
          setLead(updatedLead);
          
          toast({
            title: "Action complétée",
            description: `${actionHistory[actionIndex].actionType} a été marquée comme complétée`
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de mettre à jour l'action."
        });
      }
    }
  };

  if (isLoading) {
    return <div className="p-6 flex justify-center items-center">
        <div className="animate-spin h-8 w-8 border-4 border-chocolate-dark rounded-full border-t-transparent"></div>
      </div>;
  }
  if (!lead && id) {
    return <div className="p-6">
        <div className="text-center py-10">
          <h2 className="text-2xl font-semibold">Lead introuvable</h2>
          <p className="text-muted-foreground mt-2">Le lead que vous recherchez n'existe pas.</p>
          <CustomButton className="mt-4" variant="chocolate" onClick={() => navigate('/leads')}>
            Retour à la liste
          </CustomButton>
        </div>
      </div>;
  }

  const actionTypes: TaskType[] = ['Call', 'Visites', 'Compromis', 'Acte de vente', 'Contrat de Location', 'Propositions', 'Follow up', 'Estimation', 'Prospection', 'Admin'];
  
  const getActionTypeIcon = (type: TaskType) => {
    switch (type) {
      case 'Call': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Appel</span>;
      case 'Visites': return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">Visite</span>;
      case 'Compromis': return <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">Compromis</span>;
      case 'Acte de vente': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Acte de vente</span>;
      case 'Contrat de Location': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Contrat Location</span>;
      case 'Propositions': return <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">Proposition</span>;
      case 'Follow up': return <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-xs">Follow-up</span>;
      case 'Estimation': return <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-xs">Estimation</span>;
      case 'Prospection': return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">Prospection</span>;
      case 'Admin': return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Admin</span>;
      default: return null;
    }
  };
  
  return <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CustomButton variant="outline" onClick={() => navigate('/leads')} className="w-auto p-2 rounded border-chocolate-light text-chocolate-dark hover:bg-chocolate-light/10">
              <ArrowLeft className="h-4 w-4" />
            </CustomButton>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold">
                {lead ? `${lead.name}` : 'Nouveau Lead'}
              </h1>
              <p className="text-muted-foreground">
                {lead ? 'Modifier les informations du lead' : 'Ajouter un nouveau lead'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CustomButton 
              variant="outline" 
              onClick={handleAddAction} 
              className="w-auto p-2 rounded text-zinc-800 hover:bg-zinc-100 hover:text-zinc-900 border-zinc-800"
            >
              <Plus className="h-4 w-4" />
            </CustomButton>
            {lead && <CustomButton variant="outline" onClick={handleDelete} className="w-auto p-2 rounded text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30">
                <Trash2 className="h-4 w-4" />
              </CustomButton>}
          </div>
        </div>
        
        {/* Affichage des tags dans l'en-tête */}
        {lead && lead.tags && lead.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {lead.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="w-full bg-background border-b flex justify-between overflow-x-auto">
          <TabsTrigger 
            value="informations" 
            className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-chocolate-dark data-[state=active]:shadow-none rounded-none"
          >
            Informations générales
          </TabsTrigger>
          <TabsTrigger 
            value="criteres" 
            className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-chocolate-dark data-[state=active]:shadow-none rounded-none"
          >
            Critères de recherche
          </TabsTrigger>
          <TabsTrigger 
            value="statut" 
            className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-chocolate-dark data-[state=active]:shadow-none rounded-none"
          >
            Statut et suivi
          </TabsTrigger>
          <TabsTrigger 
            value="actions" 
            className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-chocolate-dark data-[state=active]:shadow-none rounded-none"
          >
            Actions/Tâches
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="informations" className="mt-4">
          <div className="luxury-card p-6">
            <LeadForm lead={lead} onSubmit={handleSubmit} onCancel={() => navigate('/leads')} activeTab="informations" />
          </div>
        </TabsContent>
        
        <TabsContent value="criteres" className="mt-4">
          <div className="luxury-card p-6">
            <LeadForm lead={lead} onSubmit={handleSubmit} onCancel={() => navigate('/leads')} activeTab="criteres" />
          </div>
        </TabsContent>
        
        <TabsContent value="statut" className="mt-4">
          <div className="luxury-card p-6">
            <LeadForm lead={lead} onSubmit={handleSubmit} onCancel={() => navigate('/leads')} activeTab="statut" />
          </div>
        </TabsContent>
        
        <TabsContent value="actions" className="mt-4">
          <div className="luxury-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Actions et tâches</h3>
              <CustomButton 
                variant="chocolate" 
                onClick={handleAddAction} 
                className="flex items-center gap-2 shadow-luxury hover:translate-y-[-2px] transition-all duration-300"
              >
                <Plus className="h-4 w-4" /> Ajouter une action
              </CustomButton>
            </div>
            
            {lead?.taskType ? (
              <div className="mt-4 p-4 border rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">Action actuelle</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {getActionTypeIcon(lead.taskType)}
                    </div>
                    
                    {lead.nextFollowUpDate && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Prévue le: {format(new Date(lead.nextFollowUpDate), 'dd/MM/yyyy à HH:mm')}
                      </p>
                    )}
                  </div>
                  <CustomButton 
                    variant="outline" 
                    onClick={handleAddAction}
                    className="text-xs"
                  >
                    Modifier
                  </CustomButton>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border rounded-md border-dashed mt-4">
                <p className="text-muted-foreground">Aucune action en cours</p>
                <CustomButton 
                  variant="chocolate" 
                  onClick={handleAddAction} 
                  className="mt-4"
                >
                  Ajouter une action
                </CustomButton>
              </div>
            )}
            
            <div className="mt-6">
              <h4 className="font-medium mb-3">Historique des actions</h4>
              {lead?.actionHistory && lead.actionHistory.length > 0 ? (
                <div className="space-y-3">
                  {lead.actionHistory.map((action) => (
                    <div 
                      key={action.id} 
                      className={cn(
                        "p-3 border rounded-md",
                        action.completedDate ? "bg-gray-50" : "bg-white"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            {getActionTypeIcon(action.actionType)}
                            <span className="text-sm font-medium">
                              {action.completedDate ? "Terminé" : "À faire"}
                            </span>
                          </div>
                          
                          {action.scheduledDate && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Prévu le: {format(new Date(action.scheduledDate), 'dd/MM/yyyy à HH:mm')}
                            </p>
                          )}
                          
                          {action.notes && (
                            <p className="text-sm mt-2 bg-gray-50 p-2 rounded">
                              {action.notes}
                            </p>
                          )}
                          
                          <p className="text-xs text-muted-foreground mt-2">
                            Créé le {format(new Date(action.createdAt), 'dd/MM/yyyy')}
                          </p>
                        </div>
                        
                        {!action.completedDate && (
                          <CustomButton
                            variant="outline"
                            size="sm"
                            onClick={() => markActionComplete(action.id)}
                            className="text-xs"
                          >
                            Marquer comme terminé
                          </CustomButton>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  Aucune action dans l'historique
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {isActionDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsActionDialogOpen(false)}>
          <div 
            className={cn(
              "bg-white dark:bg-gray-800 p-6 rounded-lg w-full",
              isMobile ? "max-w-[92%] mx-4" : "max-w-md"
            )} 
            onClick={(e) => e.stopPropagation()}
          >
            {!selectedAction ? (
              <>
                <h2 className="text-xl font-semibold mb-4">Sélectionner une action</h2>
                <div className="grid grid-cols-2 gap-2">
                  {actionTypes.map(actionType => (
                    <CustomButton 
                      key={actionType} 
                      variant="outline" 
                      onClick={() => handleActionSelect(actionType)} 
                      className="justify-start text-left py-2 text-zinc-800 font-normal border-zinc-800"
                    >
                      {actionType}
                    </CustomButton>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-4">Planifier {selectedAction}</h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !actionDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarClock className="mr-2 h-4 w-4" />
                          {actionDate ? format(actionDate, 'dd/MM/yyyy') : <span>Sélectionner une date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-auto p-0" 
                        align="start"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Calendar
                          mode="single"
                          selected={actionDate}
                          onSelect={(date) => {
                            setActionDate(date);
                            if (isMobile) {
                              document.querySelector('[role="dialog"]')?.classList.add('pointer-events-auto');
                            }
                          }}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Heure</label>
                    <Input
                      type="time"
                      value={actionTime}
                      onChange={(e) => setActionTime(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes</label>
                    <textarea
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      className="w-full p-2 border rounded-md resize-none h-24"
                      placeholder="Notes sur cette action..."
                    />
                  </div>
                </div>
              </>
            )}
            
            <div className={cn(
              "mt-6 flex justify-end space-x-2",
              isMobile ? "flex-col space-y-2 space-x-0" : ""
            )}>
              <CustomButton 
                variant="outline" 
                onClick={() => {
                  if (selectedAction) {
                    setSelectedAction(null);
                  } else {
                    setIsActionDialogOpen(false);
                  }
                }} 
                className={cn(
                  "text-stone-800 font-light",
                  isMobile && "order-2"
                )}
              >
                {selectedAction ? 'Retour' : 'Annuler'}
              </CustomButton>
              
              {selectedAction && (
                <CustomButton 
                  variant="chocolate" 
                  onClick={handleActionConfirm}
                  className={cn(
                    "bg-chocolate-dark text-white hover:bg-chocolate",
                    isMobile && "order-1"
                  )}
                >
                  Confirmer
                </CustomButton>
              )}
            </div>
          </div>
        </div>
      )}

      {lead && <FloatingActionButtons onAddAction={handleAddAction} phoneNumber={lead.phone} email={lead.email} />}
    </div>;
};

export default LeadEdit;
