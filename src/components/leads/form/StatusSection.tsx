
import React, { useState } from 'react';
import { LeadDetailed, LeadStatus, PipelineType } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LeadTag } from '@/components/common/TagBadge';
import TeamMemberSelect from '@/components/leads/TeamMemberSelect';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Home, Activity, Trash2, FolderOpen } from 'lucide-react';
import MultiSelectButtons from './MultiSelectButtons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from 'react-router-dom';
import { softDeleteLead } from '@/services/leadSoftDelete';
import { toast } from '@/hooks/use-toast';

const STATUS_OPTIONS: LeadStatus[] = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal',
  'Visit',
  'Offre',
  'Deposit',
  'Signed',
  'Gagné',
  'Perdu'
];

const TAG_OPTIONS: LeadTag[] = [
  "Vip", 
  "Hot", 
  "Serious", 
  "Cold", 
  "No response", 
  "No phone", 
  "Fake",
  "Not a fit"
];

interface StatusSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const StatusSection: React.FC<StatusSectionProps> = ({
  lead,
  onDataChange
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (field: keyof LeadDetailed, value: any) => {
    onDataChange({
      [field]: value
    } as Partial<LeadDetailed>);
  };

  const handleTagToggle = (tag: LeadTag) => {
    const updatedTags = lead.tags?.includes(tag)
      ? lead.tags.filter(t => t !== tag)
      : [...(lead.tags || []), tag];
    
    handleInputChange('tags', updatedTags);
  };

  const handlePipelineTypeChange = (value: PipelineType) => {
    handleInputChange('pipelineType', value);
  };

  const handleDeleteLead = async () => {
    try {
      setIsDeleting(true);
      await softDeleteLead(lead.id, deletionReason.trim() || undefined);
      
      toast({
        title: "Lead supprimé",
        description: "Le lead a été déplacé dans la corbeille avec succès."
      });
      
      navigate('/pipeline');
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
      setDeletionReason('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Type de pipeline</Label>
          <div className="flex items-center space-x-2 p-3 bg-white border rounded-md">
            <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 mr-2">
              <Home className="h-4 w-4 text-gray-500" />
            </div>
            <RadioGroup 
              value={lead.pipelineType || 'purchase'} 
              onValueChange={(value) => handlePipelineTypeChange(value as PipelineType)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="purchase" id="purchase" />
                <Label htmlFor="purchase" className="text-sm cursor-pointer">Achat</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rental" id="rental" />
                <Label htmlFor="rental" className="text-sm cursor-pointer">Location</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="owners" id="owners" />
                <Label htmlFor="owners" className="text-sm cursor-pointer">Propriétaires</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-medium">Statut du lead</Label>
          <div className="flex">
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 border border-r-0 rounded-l-md bg-white">
              <Activity className="h-4 w-4 text-gray-500" />
            </div>
            <Select 
              value={lead.status || ''} 
              onValueChange={(value) => handleInputChange('status', value as LeadStatus)}
            >
              <SelectTrigger id="status" className="w-full rounded-l-none">
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(status => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Tags</Label>
          <MultiSelectButtons
            options={TAG_OPTIONS}
            selectedValues={lead.tags || []}
            onToggle={handleTagToggle}
          />
        </div>

        {(lead.pipelineType === 'purchase' || lead.pipelineType === 'rental') && (
          <div className="space-y-2">
            <Label htmlFor="googleDriveLink" className="text-sm font-medium">Lien KYC (Google Drive)</Label>
            <div className="flex">
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 border border-r-0 rounded-l-md bg-white">
                <FolderOpen className="h-4 w-4 text-gray-500" />
              </div>
              <Input
                id="googleDriveLink"
                type="url"
                placeholder="https://drive.google.com/..."
                value={lead.google_drive_link || ''}
                onChange={(e) => handleInputChange('google_drive_link', e.target.value)}
                className="rounded-l-none"
              />
            </div>
            {lead.google_drive_link && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.open(lead.google_drive_link!, '_blank')}
                className="w-full"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Ouvrir le dossier KYC
              </Button>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="assignedTo" className="text-sm font-medium">Responsable du suivi</Label>
          <TeamMemberSelect
            value={lead.assignedTo}
            onChange={(value) => handleInputChange('assignedTo', value)}
            label=""
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Dernière interaction</Label>
          <div className="p-3 bg-gray-50 rounded-md border text-sm text-gray-700">
            {lead.lastContactedAt 
              ? new Date(lead.lastContactedAt).toLocaleDateString('fr-FR', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })
              : 'Aucune interaction enregistrée'}
          </div>
        </div>

        <div className="pt-4 border-t mt-6">
          <Button 
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="w-full flex items-center justify-center"
          >
            <Trash2 className="h-4 w-4 mr-2" /> Supprimer ce lead
          </Button>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Le lead {lead.name} sera déplacé dans la corbeille. Cette action peut être annulée par un administrateur.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-2">
            <Label htmlFor="deletion-reason" className="text-sm">Raison de la suppression (optionnel)</Label>
            <Textarea
              id="deletion-reason"
              placeholder="Ex: Doublon, faux contact, client non intéressé..."
              value={deletionReason}
              onChange={(e) => setDeletionReason(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
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
