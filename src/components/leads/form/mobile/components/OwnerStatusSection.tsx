
import React, { useState, useEffect } from 'react';
import { LeadDetailed } from '@/types/lead';
import { LeadStatus } from '@/components/common/StatusBadge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Trash2, Home } from 'lucide-react';
import MultiSelectButtons from '@/components/leads/form/MultiSelectButtons';
import TeamMemberSelect from '@/components/leads/TeamMemberSelect';
import { Button } from '@/components/ui/button';
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
import { deleteLead } from '@/services/leadService';
import { toast } from '@/hooks/use-toast';

const OWNERS_STATUSES: LeadStatus[] = [
  "New",              // Premier contact
  "Contacted",        // Rendez-vous programmé
  "Qualified",        // Visite effectuée
  "Proposal",         // Mandat en négociation
  "Signed",           // Mandat signé
  "Visit",            // Bien en commercialisation
  "Offre",            // Offre reçue
  "Deposit",          // Compromis signé
  "Gagné",            // Vente finalisée
  "Perdu"             // Perdu/Annulé
];

const LEAD_TAGS = ["Vip", "Hot", "Serious", "Cold", "No response", "No phone", "Fake"];

interface OwnerStatusSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const OwnerStatusSection: React.FC<OwnerStatusSectionProps> = ({
  lead,
  onDataChange
}) => {
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [isHeaderMeasured, setIsHeaderMeasured] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const measureHeader = () => {
      const headerElement = document.querySelector('.bg-loro-sand');
      if (headerElement) {
        const height = headerElement.getBoundingClientRect().height;
        setHeaderHeight(height);
        setIsHeaderMeasured(true);
      }
    };
    
    measureHeader();
    window.addEventListener('resize', measureHeader);
    const timeoutId = setTimeout(measureHeader, 300);
    
    return () => {
      window.removeEventListener('resize', measureHeader);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleInputChange = (field: keyof LeadDetailed, value: any) => {
    onDataChange({
      [field]: value
    } as Partial<LeadDetailed>);
  };

  const handleTagToggle = (tag: string) => {
    const updatedTags = lead.tags?.includes(tag as any)
      ? lead.tags.filter(t => t !== tag)
      : [...(lead.tags || []), tag as any];
    
    handleInputChange('tags', updatedTags);
  };

  const handleDeleteLead = async () => {
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
        description: "Impossible de supprimer ce lead."
      });
    }
  };

  const getStatusLabel = (status: LeadStatus): string => {
    const ownerStatusLabels: Record<LeadStatus, string> = {
      'New': 'Premier contact',
      'Contacted': 'Rendez-vous programmé',
      'Qualified': 'Visite effectuée',
      'Proposal': 'Mandat en négociation',
      'Signed': 'Mandat signé',
      'Visit': 'Bien en commercialisation',
      'Offre': 'Offre reçue',
      'Deposit': 'Compromis signé',
      'Gagné': 'Vente finalisée',
      'Perdu': 'Perdu/Annulé'
    };
    return ownerStatusLabels[status] || status;
  };

  const dynamicTopMargin = isHeaderMeasured 
    ? `${Math.max(headerHeight + 8, 32)}px` 
    : 'calc(32px + 4rem)';

  return (
    <div 
      className="space-y-5 pt-4" 
      style={{ marginTop: dynamicTopMargin }}
    >
      <h2 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b mb-4">Statut et Suivi</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm">Type de pipeline</Label>
          <div className="flex items-center space-x-2 p-3 bg-white border rounded-md">
            <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 mr-2">
              <Home className="h-4 w-4 text-gray-500" />
            </div>
            <span className="text-sm font-futura text-gray-700">Propriétaires</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm">Statut du lead</Label>
          <div className="flex">
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 border border-r-0 rounded-l-md bg-white">
              <Activity className="h-4 w-4 text-gray-500" />
            </div>
            <Select 
              value={lead.status || ''} 
              onValueChange={value => handleInputChange('status', value)}
            >
              <SelectTrigger id="status" className="w-full rounded-l-none font-futura">
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                {OWNERS_STATUSES.map(status => (
                  <SelectItem key={status} value={status} className="font-futura">
                    {getStatusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm">Tags</Label>
          <MultiSelectButtons
            options={LEAD_TAGS}
            selectedValues={lead.tags || []}
            onToggle={handleTagToggle}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="assignedTo" className="text-sm">Responsable du suivi</Label>
          <TeamMemberSelect
            value={lead.assignedTo}
            onChange={(value) => handleInputChange('assignedTo', value)}
            label=""
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm">Dernière interaction</Label>
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
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera définitivement le lead {lead.name} et toutes les données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLead} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OwnerStatusSection;
