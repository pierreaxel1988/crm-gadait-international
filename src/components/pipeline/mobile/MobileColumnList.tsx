import React, { useState } from 'react';
import { PlusCircle, Phone, Clock, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LeadStatus } from '@/components/common/StatusBadge';
import { FilterOptions } from '../PipelineFilters';
import { Avatar } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PipelineType } from '@/types/lead';
import { useKanbanData } from '@/hooks/useKanbanData';

// Map English status to French translations
const statusTranslations: Record<LeadStatus, string> = {
  'New': 'Nouveaux',
  'Contacted': 'Contactés',
  'Qualified': 'Qualifiés', 
  'Proposal': 'Propositions',
  'Visit': 'Visites en cours',
  'Offer': 'Offre en cours',
  'Offre': 'Offre en cours',
  'Deposit': 'Dépôt reçu',
  'Signed': 'Signature finale',
  'Gagné': 'Conclus',
  'Perdu': 'Perdu'
};

interface MobileColumnListProps {
  columns: Array<{
    title: string;
    status: LeadStatus;
    items: any[];
    pipelineType?: PipelineType;
  }>;
  expandedColumn?: LeadStatus | null;
  toggleColumnExpand?: (status: LeadStatus) => void;
  activeTab?: PipelineType;
  searchTerm?: string;
  filters?: FilterOptions;
}

const MobileColumnList = ({ 
  columns, 
  expandedColumn = null, 
  toggleColumnExpand = () => {}, 
  activeTab = 'purchase',
  searchTerm,
  filters
}: MobileColumnListProps) => {
  const [activeStatus, setActiveStatus] = useState<LeadStatus | 'all'>('all');
  const navigate = useNavigate();
  
  // Récupérer les leads depuis le hook useKanbanData
  const { loadedColumns, isLoading } = useKanbanData(columns, 0, activeTab);
  
  // Filtrer les colonnes en fonction du pipeline type actif
  const filteredColumns = loadedColumns.filter(column => 
    !column.pipelineType || column.pipelineType === activeTab
  );
  
  // Get all leads across filtered columns
  const allLeads = filteredColumns.flatMap(column => 
    column.items.map(item => ({ ...item, columnStatus: column.status }))
  );
  
  // Count leads by status (for the current pipeline type)
  const leadCountByStatus = filteredColumns.reduce((acc, column) => {
    acc[column.status] = column.items.length;
    return acc;
  }, {} as Record<string, number>);
  
  // Count total leads
  const totalLeadCount = allLeads.length;
  
  // Filter leads by selected status
  const displayedLeads = activeStatus === 'all' 
    ? allLeads 
    : allLeads.filter(lead => lead.columnStatus === activeStatus);
  
  const handleAddLead = (status: LeadStatus) => {
    navigate(`/leads/new?pipeline=${activeTab}&status=${status}`);
  };
  
  const handleLeadClick = (leadId: string) => {
    navigate(`/leads/${leadId}`);
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      // For today, just show the time
      if (new Date().toDateString() === date.toDateString()) {
        return format(date, 'HH:mm');
      }
      // Otherwise show abbreviated date
      return format(date, 'dd MMM', { locale: fr });
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <div className="pb-20">
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-sm text-muted-foreground">Chargement des leads...</p>
        </div>
      ) : (
        <>
          {/* Status filters inspired by WhatsApp */}
          <div className="overflow-x-auto py-1 sticky top-[108px] z-10 bg-white shadow-sm">
            <Tabs 
              value={activeStatus === 'all' ? 'all' : activeStatus} 
              onValueChange={(value) => setActiveStatus(value as LeadStatus | 'all')}
              className="w-full"
            >
              <TabsList className="inline-flex w-auto p-1 h-9 bg-white">
                <TabsTrigger 
                  value="all" 
                  className="rounded-full px-3 data-[state=active]:bg-chocolate-dark/10 data-[state=active]:text-chocolate-dark"
                >
                  Tous ({totalLeadCount})
                </TabsTrigger>
                {filteredColumns.map(column => (
                  leadCountByStatus[column.status] > 0 && (
                    <TabsTrigger 
                      key={column.status}
                      value={column.status}
                      className="rounded-full px-3 whitespace-nowrap data-[state=active]:bg-chocolate-dark/10 data-[state=active]:text-chocolate-dark"
                    >
                      {statusTranslations[column.status]} ({leadCountByStatus[column.status]})
                    </TabsTrigger>
                  )
                ))}
              </TabsList>
            </Tabs>
          </div>
          
          {/* Leads list */}
          <div>
            {displayedLeads.length === 0 ? (
              <div className="flex items-center justify-center h-40 bg-white">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground font-medium">Aucun lead trouvé</p>
                  <button 
                    onClick={() => handleAddLead(activeStatus === 'all' ? 'New' : activeStatus)}
                    className="mt-2 text-chocolate-dark hover:text-chocolate-dark/80 text-sm flex items-center justify-center mx-auto"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Ajouter un lead
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white divide-y divide-slate-100">
                {displayedLeads.map((lead) => (
                  <div 
                    key={lead.id} 
                    className="py-3 px-4 flex hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => handleLeadClick(lead.id)}
                  >
                    <div className="mr-3">
                      <Avatar className="h-12 w-12 bg-slate-200 border-2 border-chocolate-light/20">
                        <div className="h-full w-full flex items-center justify-center text-chocolate-dark text-lg font-medium">
                          {lead.name.charAt(0)}
                        </div>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0 border-b-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-base truncate text-chocolate-dark">
                          {lead.name}
                        </h3>
                        <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                          {formatDate(lead.createdAt)}
                        </span>
                      </div>
                      
                      <div className="mt-0.5 text-sm text-muted-foreground truncate">
                        {activeStatus === 'all' && (
                          <span className="inline-flex items-center bg-chocolate-dark/10 text-chocolate-dark text-xs px-2 py-0.5 rounded-full mr-2">
                            {statusTranslations[lead.columnStatus]}
                          </span>
                        )}
                        {lead.lastAction && (
                          <span className="text-muted-foreground/80 truncate">{lead.lastAction}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                        {lead.taskType && (
                          <span className="flex items-center mr-2">
                            {lead.taskType === 'Call' ? <Phone className="h-3 w-3 mr-1" /> : 
                             lead.taskType === 'Follow up' ? <Clock className="h-3 w-3 mr-1" /> : 
                             lead.taskType === 'Visites' ? <Calendar className="h-3 w-3 mr-1" /> : null}
                            <span className="truncate">{lead.taskType}</span>
                          </span>
                        )}
                        {lead.budget && lead.currency && (
                          <span className="truncate">{parseInt(lead.budget).toLocaleString('fr-FR')} {lead.currency}</span>
                        )}
                        {lead.desiredLocation && (
                          <span className="truncate ml-1">• {lead.desiredLocation}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Add lead button - Fixed floating action button */}
          <div className="fixed bottom-20 right-4 z-50">
            <button 
              onClick={() => handleAddLead(activeStatus === 'all' ? 'New' : activeStatus)}
              className="bg-chocolate-dark text-white h-14 w-14 rounded-full flex items-center justify-center shadow-lg hover:bg-chocolate-dark/90 transition-colors"
            >
              <PlusCircle className="h-6 w-6" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MobileColumnList;
