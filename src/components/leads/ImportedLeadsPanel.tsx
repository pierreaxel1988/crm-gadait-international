import React, { useEffect, useState } from 'react';
import { Calendar, Mail, MapPin, Phone, ExternalLink, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LeadDetailed } from '@/types/lead';
import { getLeads } from '@/services/leadService';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../ui/CustomButton';
import StatusBadge from '../common/StatusBadge';
import TagBadge from '../common/TagBadge';
import { useAuth } from '@/hooks/useAuth';

interface ImportedLeadsPanelProps {
  limit?: number;
  className?: string;
}

const ImportedLeadsPanel = ({ limit = 5, className }: ImportedLeadsPanelProps) => {
  const [recentImports, setRecentImports] = useState<LeadDetailed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { isAdmin, teamMemberId } = useAuth();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setIsLoading(true);
        const allLeads = await getLeads();
        
        // Filter for commercial users - ensure we only show leads assigned to them
        let filteredLeads = allLeads;
        if (!isAdmin && teamMemberId) {
          console.log(`Filtering imported leads for commercial user: ${teamMemberId}`);
          filteredLeads = allLeads.filter(lead => lead.assignedTo === teamMemberId);
        }
        
        // Filtrer et trier les leads importés
        const importedLeads = filteredLeads
          .filter(lead => lead.integration_source)
          .sort((a, b) => {
            const dateA = a.imported_at ? new Date(a.imported_at).getTime() : 0;
            const dateB = b.imported_at ? new Date(b.imported_at).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, limit);
        
        setRecentImports(importedLeads);
        console.log(`Showing ${importedLeads.length} imported leads for ${isAdmin ? 'admin' : 'commercial'} user`);
      } catch (error) {
        console.error('Error fetching imported leads:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeads();
  }, [limit, isAdmin, teamMemberId]);

  const handleViewLead = (id: string) => {
    navigate(`/leads/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-chocolate-dark rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (recentImports.length === 0) {
    return (
      <div className={`luxury-card p-6 ${className}`}>
        <h2 className="text-xl font-semibold mb-4">Leads Importés Récemment</h2>
        <div className="py-8 text-center">
          <p className="text-muted-foreground">Aucun lead importé récemment</p>
          <p className="text-sm text-muted-foreground mt-2">
            Les leads reçus via l'API d'importation apparaîtront ici
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`luxury-card p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Leads Importés Récemment</h2>
      <div className="space-y-4">
        {recentImports.map((lead) => (
          <div key={lead.id} className="border-b border-border pb-4 last:border-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{lead.name}</h3>
                <div className="flex flex-col space-y-1 mt-1">
                  {lead.email && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 mr-1" />
                      <span>{lead.email}</span>
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 mr-1" />
                      <span>{lead.phone}</span>
                    </div>
                  )}
                  {lead.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      <span>{lead.location}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <StatusBadge status={lead.status} />
                {lead.imported_at && (
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>
                      {format(parseISO(lead.imported_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {lead.tags && lead.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm">
                {lead.source && (
                  <span className="inline-flex items-center text-muted-foreground">
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    Source: {lead.source}
                  </span>
                )}
              </div>
              <CustomButton 
                variant="outline" 
                size="sm"
                className="text-chocolate-dark border-chocolate-light hover:bg-chocolate-light/10"
                onClick={() => handleViewLead(lead.id)}
              >
                Voir
              </CustomButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImportedLeadsPanel;
