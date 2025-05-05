
import React from 'react';
import { LeadDetailed } from '@/types/lead';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';

interface LeadInfoTabProps {
  lead: LeadDetailed;
}

const LeadInfoTab: React.FC<LeadInfoTabProps> = ({ lead }) => {
  const isMobile = useIsMobile();
  
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Non spécifié';
    
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: fr });
    } catch (e) {
      return 'Date invalide';
    }
  };
  
  const InfoSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-3">
      <h3 className="text-base font-medium text-loro-navy border-b border-loro-pearl/30 pb-1">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
  
  const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-2 gap-2">
      <div className="text-xs text-loro-navy/70">{label}</div>
      <div className="text-sm font-medium">{value || 'Non spécifié'}</div>
    </div>
  );
  
  return (
    <div className="animate-[fade-in_0.4s_ease-out]">
      <Card className="bg-white/80 rounded-xl shadow-sm border-loro-pearl/20">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoSection title="Informations de contact">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Email" value={lead.email} />
                <InfoItem label="Téléphone" value={lead.phone} />
                <InfoItem label="Pays de résidence" value={lead.country} />
                <InfoItem label="Nationalité" value={lead.nationality} />
                <InfoItem label="Langue préférée" value={lead.preferredLanguage || 'Français'} />
              </div>
            </InfoSection>
            
            <InfoSection title="Détails du lead">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Source" value={lead.leadSource} />
                <InfoItem label="Commercial" value={lead.assignedToName || 'Non assigné'} />
                <InfoItem label="Créé le" value={formatDate(lead.createdAt)} />
                <InfoItem label="Dernier contact" value={formatDate(lead.lastContactedAt)} />
                <InfoItem label="Type de lead" value={lead.pipelineType || 'Non spécifié'} />
              </div>
            </InfoSection>
            
            <InfoSection title="Notes générales">
              <p className="text-sm bg-loro-pearl/5 p-3 rounded-lg border border-loro-pearl/20 min-h-[100px] whitespace-pre-line">
                {lead.notes || 'Aucune note disponible'}
              </p>
            </InfoSection>
            
            <InfoSection title="Commentaires supplémentaires">
              <p className="text-sm bg-loro-pearl/5 p-3 rounded-lg border border-loro-pearl/20 min-h-[100px] whitespace-pre-line">
                {lead.additionalComments || 'Aucun commentaire disponible'}
              </p>
            </InfoSection>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadInfoTab;
