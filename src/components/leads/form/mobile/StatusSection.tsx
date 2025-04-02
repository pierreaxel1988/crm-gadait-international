
import React, { useState, useEffect } from 'react';
import { LeadDetailed, LeadTag } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Trash2, Phone } from 'lucide-react';
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
import LeadContactActions from '@/components/pipeline/mobile/components/LeadContactActions';

interface StatusSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
  startCall?: () => void;
  isCallDialogOpen?: boolean;
  setIsCallDialogOpen?: (isOpen: boolean) => void;
  callStatus?: 'idle' | 'calling' | 'completed' | 'failed';
  callDuration?: number;
  endCall?: (status: 'completed' | 'failed') => void;
  formatDuration?: (seconds: number) => string;
}

const LEAD_STATUSES = [
  "New", "Contacted", "Qualified", "Proposal", "Visit", 
  "Offer", "Offre", "Deposit", "Signed", "Gagné", "Perdu"
];

const LEAD_TAGS = ["Vip", "Hot", "Serious", "Cold", "No response", "No phone", "Fake"];

const StatusSection: React.FC<StatusSectionProps> = ({
  lead,
  onDataChange,
  startCall,
  isCallDialogOpen = false,
  setIsCallDialogOpen = () => {},
  callStatus = 'idle',
  callDuration = 0,
  endCall = () => {},
  formatDuration = (seconds) => `${Math.floor(seconds / 60)}:${seconds % 60 < 10 ? '0' : ''}${seconds % 60}`
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
    const updatedTags = lead.tags?.includes(tag as LeadTag)
      ? lead.tags.filter(t => t !== tag)
      : [...(lead.tags || []), tag as LeadTag];
    
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

  const handlePhoneCall = (e: React.MouseEvent) => {
    e.preventDefault();
    if (startCall) {
      startCall();
    } else if (lead.phone) {
      window.location.href = `tel:${lead.phone}`;
    }
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (lead.phone) {
      const cleanedPhone = lead.phone.replace(/[^\d+]/g, '');
      window.open(`https://wa.me/${cleanedPhone}`, '_blank');
    }
  };

  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (lead.email) {
      window.location.href = `mailto:${lead.email}`;
    }
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
                {LEAD_STATUSES.map(status => (
                  <SelectItem key={status} value={status} className="font-futura">
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Contact Actions */}
        <div className="space-y-2 pt-2">
          <Label className="text-sm">Actions rapides</Label>
          <div className="flex items-center justify-between">
            <LeadContactActions 
              phone={lead.phone}
              email={lead.email}
              handlePhoneCall={handlePhoneCall}
              handleWhatsAppClick={handleWhatsAppClick}
              handleEmailClick={handleEmailClick}
            />
            
            {callStatus === 'calling' && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => endCall('completed')} 
                className="ml-auto animate-pulse"
              >
                <Phone className="h-4 w-4 mr-2" />
                {formatDuration(callDuration)}
              </Button>
            )}
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

      <AlertDialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {callStatus === 'calling' ? 'Appel en cours...' : 
               callStatus === 'completed' ? 'Appel terminé' : 
               callStatus === 'failed' ? 'Appel échoué' : 'Appel'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {callStatus === 'calling' ? (
                <div className="text-center py-4">
                  <div className="flex justify-center mb-4">
                    <div className="animate-pulse bg-green-100 rounded-full p-4">
                      <Phone className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <p>En appel avec {lead.name}</p>
                  <p className="text-2xl font-semibold mt-2">{formatDuration(callDuration)}</p>
                </div>
              ) : callStatus === 'completed' ? (
                <p>L'appel a été enregistré avec succès.</p>
              ) : callStatus === 'failed' ? (
                <p>L'appel n'a pas pu être effectué.</p>
              ) : (
                <p>Voulez-vous appeler {lead.name} au {lead.phone}?</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {callStatus === 'calling' ? (
              <>
                <AlertDialogCancel onClick={() => endCall('failed')}>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={() => endCall('completed')} className="bg-green-600 hover:bg-green-700">
                  Terminer l'appel
                </AlertDialogAction>
              </>
            ) : callStatus === 'completed' || callStatus === 'failed' ? (
              <AlertDialogAction onClick={() => setIsCallDialogOpen(false)}>OK</AlertDialogAction>
            ) : (
              <>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={startCall} className="bg-green-600 hover:bg-green-700">
                  Appeler
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StatusSection;
