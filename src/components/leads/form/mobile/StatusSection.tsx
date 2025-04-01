
import React, { useState } from 'react';
import { LeadDetailed } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MultiSelectButtons from '@/components/leads/form/MultiSelectButtons';
import TeamMemberSelect from '@/components/leads/TeamMemberSelect';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { LeadStatus } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { deleteLead } from '@/services/leadUpdater';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface StatusSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const StatusSection: React.FC<StatusSectionProps> = ({ lead, onDataChange }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (field: keyof LeadDetailed, value: any) => {
    onDataChange({ [field]: value } as Partial<LeadDetailed>);
  };
  
  const leadStatuses: LeadStatus[] = [
    "New",       // Nouveaux
    "Contacted", // Contactés
    "Qualified", // Qualifiés
    "Proposal",  // Propositions
    "Visit",     // Visites en cours
    "Offer",     // Offre en cours (English)
    "Offre",     // Offre en cours (French)
    "Deposit",   // Dépôt reçu
    "Signed",    // Signature finale
    "Gagné",     // Conclus
    "Perdu"      // Perdu
  ];
  
  const leadTags: string[] = ["Vip", "Hot", "Serious", "Cold", "No response", "No phone", "Fake", "Imported"];

  const handleTagToggle = (tag: string) => {
    const currentTags = lead.tags || [];
    const updatedTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    handleInputChange('tags', updatedTags);
  };

  const formattedLastContact = lead.lastContactedAt 
    ? format(new Date(lead.lastContactedAt), 'dd/MM/yyyy HH:mm')
    : '';
    
  const formattedNextFollowUp = lead.nextFollowUpDate 
    ? format(new Date(lead.nextFollowUpDate), 'dd/MM/yyyy HH:mm')
    : '';
    
  const handleDeleteLead = async () => {
    if (!lead.id) return;
    
    try {
      setIsDeleting(true);
      const success = await deleteLead(lead.id);
      
      if (success) {
        toast({
          title: "Lead supprimé",
          description: "Le lead a été supprimé avec succès."
        });
        navigate('/pipeline');
      } else {
        throw new Error("Échec de la suppression");
      }
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer ce lead."
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-5 pt-4 mt-2">
      <h2 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b mb-4">Statut & Suivi</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm text-gray-700">Statut du lead</Label>
          <Select
            value={lead.status || "New"}
            onValueChange={(value) => handleInputChange('status', value)}
          >
            <SelectTrigger id="status" className="w-full font-futura h-9">
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              {leadStatuses.map((status) => (
                <SelectItem key={status} value={status} className="font-futura">
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">Tags</Label>
          <MultiSelectButtons
            options={leadTags}
            selectedValues={lead.tags || []}
            onToggle={handleTagToggle}
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">Responsable du suivi</Label>
          <TeamMemberSelect
            value={lead.assignedTo}
            onChange={(value) => handleInputChange('assignedTo', value)}
            label="Attribuer à"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastContactedAt" className="text-sm text-gray-700">Date du dernier contact</Label>
          <Input
            id="lastContactedAt"
            value={formattedLastContact}
            className="w-full font-futura bg-gray-50 h-9 text-sm"
            readOnly
          />
          <p className="text-xs text-muted-foreground">Mise à jour automatique lors d'une action</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="nextFollowUpDate" className="text-sm text-gray-700">Prochain suivi prévu</Label>
          <Input
            id="nextFollowUpDate"
            value={formattedNextFollowUp}
            className="w-full font-futura bg-gray-50 h-9 text-sm"
            readOnly
          />
          <p className="text-xs text-muted-foreground">Programmé automatiquement lors de la création d'une action</p>
        </div>
        
        <div className="pt-4 mt-6 border-t border-gray-200">
          <Button 
            variant="destructive" 
            size="sm" 
            className="w-full"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer ce lead
          </Button>
        </div>
      </div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le lead</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce lead ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteLead}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StatusSection;
