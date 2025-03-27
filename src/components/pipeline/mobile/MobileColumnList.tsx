
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, PlusCircle, Clock, Phone, Calendar, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LeadStatus } from '@/components/common/StatusBadge';
import { FilterOptions } from '../PipelineFilters';
import { Avatar } from "@/components/ui/avatar";
import { format, isPast, isFuture, isToday } from 'date-fns';
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

interface MobileLeadItem {
  id: string;
  name: string;
  columnStatus: LeadStatus;
  budget?: string;
  currency?: Currency;
  desiredLocation?: string;
  taskType?: string;
  createdAt?: string;
  nextFollowUpDate?: string;
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
  
  const {
    loadedColumns,
    isLoading
  } = useKanbanData(columns, 0, activeTab);
  
  const filteredColumns = loadedColumns.filter(column => !column.pipelineType || column.pipelineType === activeTab);

  const allLeads = filteredColumns.flatMap(column => column.items.map(item => ({
    ...item,
    columnStatus: column.status
  })));
  
  const leadCountByStatus = filteredColumns.reduce((acc, column) => {
    acc[column.status] = column.items.length;
    return acc;
  }, {} as Record<string, number>);
  
  const totalLeadCount = allLeads.length;
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

  const getActionStatusStyle = (followUpDate?: string) => {
    if (!followUpDate) return {};
    
    const followUpDateTime = new Date(followUpDate);
    
    if (isPast(followUpDateTime) && !isToday(followUpDateTime)) {
      return {
        taskClassName: "bg-red-100 text-red-800 rounded-full px-2 py-0.5",
        iconClassName: "text-red-600",
        containerClassName: "border-red-200 bg-red-50/50"
      };
    } else if (isToday(followUpDateTime)) {
      return {
        taskClassName: "bg-amber-100 text-amber-800 rounded-full px-2 py-0.5",
        iconClassName: "text-amber-600",
        containerClassName: "border-amber-200 bg-amber-50/50"
      };
    } else {
      return {
        taskClassName: "bg-green-100 text-green-800 rounded-full px-2 py-0.5",
        iconClassName: "text-green-600",
        containerClassName: "border-green-200 bg-green-50/50"
      };
    }
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-sm text-muted-foreground">Chargement des leads...</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto pb-1">
            <Tabs 
              value={activeStatus === 'all' ? 'all' : activeStatus} 
              onValueChange={value => setActiveStatus(value as LeadStatus | 'all')} 
              className="w-full"
            >
              <TabsList className="inline-flex w-auto p-1 h-10 bg-gray-100 rounded-full">
                <TabsTrigger 
                  value="all" 
                  className="rounded-full px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Tous ({totalLeadCount})
                </TabsTrigger>
                {filteredColumns.map(column => 
                  leadCountByStatus[column.status] > 0 && (
                    <TabsTrigger 
                      key={column.status} 
                      value={column.status} 
                      className="rounded-full px-4 whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      {statusTranslations[column.status]} ({leadCountByStatus[column.status]})
                    </TabsTrigger>
                  )
                )}
              </TabsList>
            </Tabs>
          </div>
          
          <div className="space-y-px">
            {displayedLeads.length === 0 ? (
              <div className="flex items-center justify-center h-40 border border-dashed border-border rounded-md bg-white">
                <div className="text-center">
                  <p className="text-sm text-zinc-900 font-medium">Aucun lead trouvé</p>
                  <button 
                    onClick={() => handleAddLead(activeStatus === 'all' ? 'New' : activeStatus)} 
                    className="mt-2 text-loro-hazel hover:text-loro-hazel/80 text-sm flex items-center justify-center mx-auto"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Ajouter un lead
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 divide-y shadow-sm">
                {displayedLeads.map(lead => {
                  const actionStyle = getActionStatusStyle(lead.nextFollowUpDate);
                  
                  return (
                    <div 
                      key={lead.id} 
                      className={`py-3 px-4 flex items-center hover:bg-slate-50 transition-colors cursor-pointer ${lead.nextFollowUpDate ? actionStyle.containerClassName : ''}`} 
                      onClick={() => handleLeadClick(lead.id)}
                    >
                      <div className="mr-3">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                          <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium">
                            {lead.name.charAt(0)}
                          </div>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-medium text-base truncate text-zinc-900">{lead.name}</h3>
                          <span className="text-xs text-zinc-500 ml-2 whitespace-nowrap">
                            {formatDate(lead.createdAt)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center text-sm text-zinc-700 mt-1 gap-1">
                          {activeStatus === 'all' && (
                            <span className="inline-flex items-center bg-zinc-100 text-zinc-900 text-xs px-2 py-0.5 rounded-full">
                              {statusTranslations[lead.columnStatus]}
                            </span>
                          )}
                          {lead.taskType && (
                            <span className={`flex items-center ${lead.nextFollowUpDate ? actionStyle.taskClassName : 'bg-zinc-100 text-zinc-700 rounded-full px-2 py-0.5'}`}>
                              {lead.taskType === 'Call' ? 
                                <Phone className={`h-3 w-3 mr-1 ${lead.nextFollowUpDate ? actionStyle.iconClassName : 'text-zinc-600'}`} /> : 
                               lead.taskType === 'Follow up' ? 
                                <Clock className={`h-3 w-3 mr-1 ${lead.nextFollowUpDate ? actionStyle.iconClassName : 'text-zinc-600'}`} /> : 
                               lead.taskType === 'Visites' ? 
                                <Calendar className={`h-3 w-3 mr-1 ${lead.nextFollowUpDate ? actionStyle.iconClassName : 'text-zinc-600'}`} /> : 
                                null
                              }
                              <span className={`truncate text-xs ${lead.nextFollowUpDate ? '' : 'text-zinc-900'}`}>
                                {lead.taskType}
                              </span>
                            </span>
                          )}
                          {lead.desiredLocation && (
                            <span className="flex items-center bg-zinc-100 text-zinc-700 rounded-full px-2 py-0.5">
                              <MapPin className="h-3 w-3 mr-1 text-zinc-600" />
                              <span className="truncate text-xs text-zinc-900">
                                {lead.desiredLocation}
                              </span>
                            </span>
                          )}
                          {lead.budget && (
                            <span className="truncate text-xs font-medium bg-zinc-100 text-zinc-900 rounded-full px-2 py-0.5">
                              {formatBudget(lead.budget, lead.currency)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="fixed bottom-20 right-6 z-50">
            <button 
              onClick={() => handleAddLead(activeStatus === 'all' ? 'New' : activeStatus)} 
              className="text-white h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-colors bg-zinc-900 hover:bg-zinc-800"
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
