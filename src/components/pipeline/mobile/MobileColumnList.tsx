
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, PlusCircle, Clock, Phone, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LeadStatus } from '@/components/common/StatusBadge';
import { FilterOptions } from '../PipelineFilters';
import { Avatar } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PipelineType } from '@/types/lead';

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
  
  console.log(`MobileColumnList - activeTab: ${activeTab}`);
  console.log(`MobileColumnList - columns: ${columns.length}`);
  
  // Log count of leads per column
  columns.forEach(col => {
    console.log(`Colonne ${col.title}: ${col.items.length} leads (pipelineType: ${col.pipelineType})`);
  });
  
  // Filtrer les colonnes en fonction du pipeline type actif
  const filteredColumns = columns.filter(column => 
    !column.pipelineType || column.pipelineType === activeTab
  );
  
  console.log(`MobileColumnList - Colonnes filtrées par type (${activeTab}): ${filteredColumns.length}`);
  
  // Get all leads across filtered columns
  const allLeads = filteredColumns.flatMap(column => 
    column.items.map(item => ({ ...item, columnStatus: column.status }))
  );
  
  console.log(`MobileColumnList - Total leads (type ${activeTab}): ${allLeads.length}`);
  
  // Count leads by status (for the current pipeline type)
  const leadCountByStatus = filteredColumns.reduce((acc, column) => {
    acc[column.status] = column.items.length;
    return acc;
  }, {} as Record<string, number>);
  
  // Count total leads
  const totalLeadCount = allLeads.length;
  console.log(`MobileColumnList - Total lead count: ${totalLeadCount}`);
  
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
    <div className="space-y-4">
      {/* Status filters inspired by WhatsApp */}
      <div className="overflow-x-auto pb-1">
        <Tabs 
          value={activeStatus === 'all' ? 'all' : activeStatus} 
          onValueChange={(value) => setActiveStatus(value as LeadStatus | 'all')}
          className="w-full"
        >
          <TabsList className="inline-flex w-auto p-1 h-10 bg-gray-100 rounded-full">
            <TabsTrigger 
              value="all" 
              className="rounded-full px-4 data-[state=active]:bg-white"
            >
              Tous ({totalLeadCount})
            </TabsTrigger>
            {filteredColumns.map(column => (
              leadCountByStatus[column.status] > 0 && (
                <TabsTrigger 
                  key={column.status}
                  value={column.status}
                  className="rounded-full px-4 whitespace-nowrap data-[state=active]:bg-white"
                >
                  {statusTranslations[column.status]} ({leadCountByStatus[column.status]})
                </TabsTrigger>
              )
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      {/* Leads list */}
      <div className="space-y-px">
        {displayedLeads.length === 0 ? (
          <div className="flex items-center justify-center h-40 border border-dashed border-border rounded-md bg-white">
            <div className="text-center">
              <p className="text-sm text-muted-foreground font-medium">Aucun lead trouvé</p>
              <button 
                onClick={() => handleAddLead(activeStatus === 'all' ? 'New' : activeStatus)}
                className="mt-2 text-primary hover:text-primary/80 text-sm flex items-center justify-center mx-auto"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Ajouter un lead
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-md border border-slate-200 divide-y">
            {displayedLeads.map((lead) => (
              <div 
                key={lead.id} 
                className="py-3 px-4 flex items-center hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => handleLeadClick(lead.id)}
              >
                <div className="mr-3">
                  <Avatar className="h-12 w-12 border-2 border-white">
                    <div className="bg-slate-200 h-full w-full flex items-center justify-center text-slate-500 text-lg font-medium">
                      {lead.name.charAt(0)}
                    </div>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-medium text-base truncate">{lead.name}</h3>
                    <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                      {formatDate(lead.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-0.5">
                    {activeStatus === 'all' && (
                      <span className="inline-flex items-center bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full mr-2">
                        {statusTranslations[lead.columnStatus]}
                      </span>
                    )}
                    {lead.taskType && (
                      <span className="flex items-center mr-2">
                        {lead.taskType === 'Call' ? <Phone className="h-3 w-3 mr-1" /> : 
                         lead.taskType === 'Follow up' ? <Clock className="h-3 w-3 mr-1" /> : 
                         lead.taskType === 'Visites' ? <Calendar className="h-3 w-3 mr-1" /> : null}
                        <span className="truncate">{lead.taskType}</span>
                      </span>
                    )}
                    {lead.budget && (
                      <span className="truncate">{lead.budget}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Add lead button */}
      <div className="fixed bottom-20 right-6 z-50">
        <button 
          onClick={() => handleAddLead(activeStatus === 'all' ? 'New' : activeStatus)}
          className="bg-primary text-white h-14 w-14 rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
        >
          <PlusCircle className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default MobileColumnList;
