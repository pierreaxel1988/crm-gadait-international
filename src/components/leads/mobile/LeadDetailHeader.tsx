
import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { deleteLead } from '@/services/leadService';
import { LeadDetailed } from '@/types/lead';
import { Button } from '@/components/ui/button';
import { addActionToLead } from '@/services/leadService';
import { TaskType } from '@/components/kanban/KanbanCard';

interface LeadDetailHeaderProps {
  lead: LeadDetailed;
  onEdit: () => void;
  onDelete: () => void;
}

const LeadDetailHeader: React.FC<LeadDetailHeaderProps> = ({ lead, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteLead(lead.id);
      toast({
        title: "Lead supprimé",
        description: "Le lead a été supprimé avec succès."
      });
      navigate('/pipeline');
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le lead."
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCall = async () => {
    try {
      const actionData = {
        actionType: "Call" as TaskType,
        scheduledDate: new Date().toISOString(),
        notes: `Appel du prospect ${lead.name}`
      };
      
      await addActionToLead(lead.id, actionData);
      toast({
        title: "Action ajoutée",
        description: "L'action d'appel a été ajoutée au lead."
      });
    } catch (error) {
      console.error("Error adding call action:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter l'action d'appel."
      });
    }
  };

  const handleEmail = () => {
    window.location.href = `mailto:${lead.email}`;
  };

  const handleNavigation = () => {
    if (lead.location) {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.location)}`;
      window.open(mapsUrl, '_blank');
    } else {
      toast({
        variant: "destructive",
        title: "Aucune adresse",
        description: "Aucune adresse n'est enregistrée pour ce lead."
      });
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <h1 className="text-lg font-semibold">{lead.name}</h1>
        <div className="flex space-x-2">
          <Button size="icon" variant="ghost" onClick={handleCall}>
            <Phone className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={handleEmail}>
            <Mail className="h-4 w-4" />
          </Button>
          {lead.location && (
            <Button size="icon" variant="ghost" onClick={handleNavigation}>
              <MapPin className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Suppression...' : 'Supprimer'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LeadDetailHeader;
