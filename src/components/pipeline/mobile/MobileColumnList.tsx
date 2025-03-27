import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, PlusCircle, Clock, Phone, Calendar, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LeadStatus } from '@/components/common/StatusBadge';
import { FilterOptions } from '../PipelineFilters';
import { Avatar } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PipelineType, Currency } from '@/types/lead';
import { useKanbanData } from '@/hooks/useKanbanData';
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

// Extend the lead type to include the properties we need
interface MobileLeadItem {
  id: string;
  name: string;
  columnStatus: LeadStatus;
  budget?: string;
  currency?: Currency;
  desiredLocation?: string;
  taskType?: string;
  createdAt?: string;
}
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
  console.log(`MobileColumnList - columns reçues: ${columns.length}`);
  const {
    loadedColumns,
    isLoading
  } = useKanbanData(columns, 0, activeTab);
  loadedColumns.forEach(col => {
    console.log(`Colonne ${col.title} (${col.status}): ${col.items.length} leads (pipelineType: ${col.pipelineType})`);
  });
  const filteredColumns = loadedColumns.filter(column => !column.pipelineType || column.pipelineType === activeTab);
  console.log(`MobileColumnList - Colonnes filtrées par type (${activeTab}): ${filteredColumns.length}`);

  // Map the leads adding the column status to each lead
  const allLeads = filteredColumns.flatMap(column => column.items.map(item => ({
    ...item,
    columnStatus: column.status
  })));
  console.log(`MobileColumnList - Total leads (type ${activeTab}): ${allLeads.length}`);
  const leadCountByStatus = filteredColumns.reduce((acc, column) => {
    acc[column.status] = column.items.length;
    return acc;
  }, {} as Record<string, number>);
  const totalLeadCount = allLeads.length;
  console.log(`MobileColumnList - Total lead count: ${totalLeadCount}`);
  const displayedLeads = activeStatus === 'all' ? allLeads : allLeads.filter(lead => lead.columnStatus === activeStatus);
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
      if (new Date().toDateString() === date.toDateString()) {
        return format(date, 'HH:mm');
      }
      return format(date, 'dd MMM', {
        locale: fr
      });
    } catch (error) {
      return dateString;
    }
  };
  const formatBudget = (budgetStr?: string, currency?: string) => {
    if (!budgetStr) return '';
    if (budgetStr.includes(',') || budgetStr.includes(' ') || budgetStr.includes('$') || budgetStr.includes('€')) {
      return budgetStr;
    }
    const numValue = parseInt(budgetStr.replace(/[^\d]/g, ''));
    if (isNaN(numValue)) return budgetStr;
    const currencySymbol = getCurrencySymbol(currency);
    const formattedNumber = new Intl.NumberFormat('fr-FR').format(numValue);
    if (currency === 'EUR') {
      return `${formattedNumber} ${currencySymbol}`;
    } else {
      return `${currencySymbol}${formattedNumber}`;
    }
  };
  const getCurrencySymbol = (currency?: string): string => {
    switch (currency) {
      case 'EUR':
        return '€';
      case 'USD':
        return '$';
      case 'GBP':
        return '£';
      case 'CHF':
        return 'CHF';
      case 'AED':
        return 'AED';
      case 'MUR':
        return 'Rs';
      default:
        return '€';
    }
  };
  return <div className="space-y-4">
      {isLoading ? <div className="flex items-center justify-center h-40">
          <p className="text-sm text-muted-foreground">Chargement des leads...</p>
        </div> : <>
          <div className="overflow-x-auto pb-1">
            <Tabs value={activeStatus === 'all' ? 'all' : activeStatus} onValueChange={value => setActiveStatus(value as LeadStatus | 'all')} className="w-full">
              <TabsList className="inline-flex w-auto p-1 h-10 bg-gray-100 rounded-full">
                <TabsTrigger value="all" className="rounded-full px-4 data-[state=active]:bg-white">
                  Tous ({totalLeadCount})
                </TabsTrigger>
                {filteredColumns.map(column => leadCountByStatus[column.status] > 0 && <TabsTrigger key={column.status} value={column.status} className="rounded-full px-4 whitespace-nowrap data-[state=active]:bg-white">
                      {statusTranslations[column.status]} ({leadCountByStatus[column.status]})
                    </TabsTrigger>)}
              </TabsList>
            </Tabs>
          </div>
          
          <div className="space-y-px">
            {displayedLeads.length === 0 ? <div className="flex items-center justify-center h-40 border border-dashed border-border rounded-md bg-white">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground font-medium">Aucun lead trouvé</p>
                  <button onClick={() => handleAddLead(activeStatus === 'all' ? 'New' : activeStatus)} className="mt-2 text-primary hover:text-primary/80 text-sm flex items-center justify-center mx-auto">
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Ajouter un lead
                  </button>
                </div>
              </div> : <div className="bg-white rounded-md border border-slate-200 divide-y">
                {displayedLeads.map(lead => <div key={lead.id} className="py-3 px-4 flex items-center hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => handleLeadClick(lead.id)}>
                    <div className="mr-3">
                      <Avatar className="h-12 w-12 border-2 border-white">
                        <div className="bg-slate-200 h-full w-full flex items-center justify-center text-slate-500 text-lg font-medium">
                          {lead.name.charAt(0)}
                        </div>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium text-base truncate text-zinc-900">{lead.name}</h3>
                        <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                          {formatDate(lead.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mt-0.5">
                        {activeStatus === 'all' && <span className="inline-flex items-center bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full mr-2">
                            {statusTranslations[lead.columnStatus]}
                          </span>}
                        {lead.taskType && <span className="flex items-center mr-2">
                            {lead.taskType === 'Call' ? <Phone className="h-3 w-3 mr-1 text-loro-sand" /> : lead.taskType === 'Follow up' ? <Clock className="h-3 w-3 mr-1 text-loro-terracotta" /> : lead.taskType === 'Visites' ? <Calendar className="h-3 w-3 mr-1 text-primary" /> : null}
                            <span className="truncate text-xs text-loro-navy">{lead.taskType}</span>
                          </span>}
                        {lead.desiredLocation && <span className="flex items-center mr-2">
                            <MapPin className="h-3 w-3 mr-1 text-loro-hazel" />
                            <span className="truncate text-xs text-loro-navy/90">{lead.desiredLocation}</span>
                          </span>}
                        {lead.budget && <span className="truncate text-xs text-loro-terracotta font-medium">
                          {lead.taskType || lead.desiredLocation ? ", " : ""}
                          {formatBudget(lead.budget, lead.currency)}
                        </span>}
                      </div>
                    </div>
                  </div>)}
              </div>}
          </div>
          
          <div className="fixed bottom-20 right-6 z-50">
            <button onClick={() => handleAddLead(activeStatus === 'all' ? 'New' : activeStatus)} className="text-white h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-colors bg-zinc-900 hover:bg-zinc-800">
              <PlusCircle className="h-6 w-6" />
            </button>
          </div>
        </>}
    </div>;
};
export default MobileColumnList;