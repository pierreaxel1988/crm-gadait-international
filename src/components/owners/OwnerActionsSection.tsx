
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Calendar, Check, X, Clock } from "lucide-react";
import { addOwnerAction, getOwnerActions, updateOwnerActionStatus } from "@/services/ownerService";
import { toast } from "@/hooks/use-toast";
import { format, isPast, isToday, addDays } from "date-fns";
import { fr } from "date-fns/locale";

interface OwnerActionsSectionProps {
  ownerId: string;
}

const OwnerActionsSection: React.FC<OwnerActionsSectionProps> = ({ ownerId }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState("call");
  const [actionDate, setActionDate] = useState("");
  const [actionNotes, setActionNotes] = useState("");
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [actions, setActions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchActions = async () => {
      setIsLoading(true);
      const actionsData = await getOwnerActions(ownerId);
      setActions(actionsData);
      setIsLoading(false);
    };
    
    fetchActions();
  }, [ownerId]);
  
  const handleAddAction = async () => {
    if (!actionType || !actionDate) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires."
      });
      return;
    }
    
    setIsAddingAction(true);
    
    try {
      const newAction = {
        owner_id: ownerId,
        action_type: actionType,
        scheduled_date: new Date(actionDate).toISOString(),
        notes: actionNotes,
        status: "todo"
      };
      
      const success = await addOwnerAction(newAction);
      
      if (success) {
        // Ajouter l'action à la liste locale
        setActions([
          {
            id: Date.now().toString(), // ID temporaire
            ...newAction,
            action_date: new Date().toISOString()
          },
          ...actions
        ]);
        
        // Réinitialiser le formulaire
        setActionType("call");
        setActionDate("");
        setActionNotes("");
        setIsDialogOpen(false);
      }
    } finally {
      setIsAddingAction(false);
    }
  };
  
  const handleToggleActionStatus = async (actionId: string, currentStatus: string) => {
    const newStatus = currentStatus === "todo" ? "completed" : "todo";
    
    const success = await updateOwnerActionStatus(actionId, newStatus);
    
    if (success) {
      // Mettre à jour la liste locale
      setActions(actions.map(action => 
        action.id === actionId 
          ? { 
              ...action, 
              status: newStatus, 
              completed_date: newStatus === "completed" ? new Date().toISOString() : null 
            } 
          : action
      ));
    }
  };
  
  // Définir la date par défaut pour demain
  useEffect(() => {
    const tomorrow = addDays(new Date(), 1);
    setActionDate(format(tomorrow, "yyyy-MM-dd'T'HH:mm"));
  }, [isDialogOpen]);
  
  const getActionTypeIcon = (type: string) => {
    switch (type) {
      case "call":
        return "☎️";
      case "email":
        return "📧";
      case "visit":
        return "🏠";
      case "meeting":
        return "👥";
      case "follow_up":
        return "📅";
      default:
        return "📋";
    }
  };
  
  const getActionTypeLabel = (type: string) => {
    switch (type) {
      case "call":
        return "Appel";
      case "email":
        return "Email";
      case "visit":
        return "Visite";
      case "meeting":
        return "Rendez-vous";
      case "follow_up":
        return "Suivi";
      default:
        return type;
    }
  };
  
  const getDueDateStyle = (scheduledDate: string) => {
    const date = new Date(scheduledDate);
    
    if (isPast(date) && !isToday(date)) {
      return "text-red-500 font-medium";
    }
    
    if (isToday(date)) {
      return "text-amber-500 font-medium";
    }
    
    return "text-muted-foreground";
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Actions et tâches</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle action
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Planifier une action</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="action_type">Type d'action</Label>
                <Select onValueChange={setActionType} defaultValue={actionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Appel</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="visit">Visite</SelectItem>
                    <SelectItem value="meeting">Rendez-vous</SelectItem>
                    <SelectItem value="follow_up">Suivi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="action_date">Date prévue</Label>
                <Input
                  id="action_date"
                  type="datetime-local"
                  value={actionDate}
                  onChange={(e) => setActionDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="action_notes">Notes</Label>
                <Textarea
                  id="action_notes"
                  placeholder="Détails sur l'action à réaliser..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddAction} disabled={isAddingAction}>
                {isAddingAction ? "Ajout en cours..." : "Planifier"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-6">
            <p>Chargement des actions...</p>
          </div>
        ) : actions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>Aucune action planifiée pour ce propriétaire.</p>
            <p className="text-sm">Cliquez sur "Nouvelle action" pour planifier une tâche.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {actions.map((action) => (
              <div 
                key={action.id} 
                className={`flex items-start justify-between p-3 border rounded-md ${
                  action.status === "completed" ? "bg-gray-50" : "bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getActionTypeIcon(action.action_type)}</div>
                  <div>
                    <p className={`font-medium ${action.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                      {getActionTypeLabel(action.action_type)}
                    </p>
                    <div className="flex items-center gap-1 text-xs mt-1">
                      <Calendar className="h-3 w-3" />
                      <span className={getDueDateStyle(action.scheduled_date)}>
                        {format(new Date(action.scheduled_date), "d MMMM yyyy à HH:mm", { locale: fr })}
                      </span>
                    </div>
                    {action.notes && (
                      <p className="text-sm mt-2 text-muted-foreground">{action.notes}</p>
                    )}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleToggleActionStatus(action.id, action.status)}
                  className={action.status === "completed" ? "text-muted-foreground" : "text-green-600"}
                >
                  {action.status === "completed" ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OwnerActionsSection;
