
import React, { useState, useEffect, useMemo } from 'react';
import { Filter, Plus, Settings, Home, Key, X } from 'lucide-react';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import { KanbanItem } from '@/components/kanban/KanbanCard';
import CustomButton from '@/components/ui/CustomButton';
import { LeadStatus } from '@/components/common/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from '@/hooks/use-mobile';
import FloatingActionButtons from '@/components/ui/FloatingActionButtons';
import PipelineFilters, { FilterOptions } from '@/components/pipeline/PipelineFilters';
import { LeadTag } from '@/components/common/TagBadge';
import TagBadge from '@/components/common/TagBadge';
import { PropertyType, PurchaseTimeframe } from '@/types/lead';

// Mock data for purchase leads
const mockPurchaseLeads: KanbanItem[] = [
  {
    id: '1',
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    phone: '+33 6 12 34 56 78',
    status: 'Qualified',
    tags: ['Vip', 'Hot'],
    assignedTo: 'Sophie Martin',
    dueDate: 'Jun 25',
    pipelineType: 'purchase',
    taskType: 'Visites'
  },
  {
    id: '2',
    name: 'Marie Lambert',
    email: 'marie.lambert@example.com',
    phone: '+33 6 23 45 67 89',
    status: 'New',
    tags: ['Serious'],
    assignedTo: 'Thomas Bernard',
    pipelineType: 'purchase',
    taskType: 'Call'
  },
  {
    id: '5',
    name: 'Antoine Richard',
    email: 'antoine.richard@example.com',
    phone: '+33 6 56 78 90 12',
    status: 'Proposal',
    tags: ['Serious'],
    assignedTo: 'Sophie Martin',
    dueDate: 'Jun 18',
    pipelineType: 'purchase',
    taskType: 'Propositions'
  },
  {
    id: '8',
    name: 'Sophie Dubois',
    email: 'sophie.dubois@example.com',
    phone: '+33 6 78 90 12 34',
    status: 'Deposit',
    tags: ['Vip'],
    assignedTo: 'Julie Dubois',
    dueDate: 'Jun 15',
    pipelineType: 'purchase',
    taskType: 'Compromis'
  },
  {
    id: '9',
    name: 'Luc Martin',
    email: 'luc.martin@example.com',
    phone: '+33 6 89 01 23 45',
    status: 'Signed',
    tags: ['Vip', 'Hot'],
    assignedTo: 'Lucas Petit',
    pipelineType: 'purchase',
    taskType: 'Acte de vente'
  }
];

// Mock data for rental leads
const mockRentalLeads: KanbanItem[] = [
  {
    id: '3',
    name: 'Pierre Moreau',
    email: 'pierre.moreau@example.com',
    phone: '+33 6 34 56 78 90',
    status: 'Contacted',
    tags: ['Cold', 'No response'],
    assignedTo: 'Julie Dubois',
    dueDate: 'Jun 20',
    pipelineType: 'rental',
    taskType: 'Follow up'
  },
  {
    id: '4',
    name: 'Claire Simon',
    email: 'claire.simon@example.com',
    status: 'Visit',
    tags: ['Hot'],
    assignedTo: 'Lucas Petit',
    dueDate: 'Jun 22',
    pipelineType: 'rental',
    taskType: 'Visites'
  },
  {
    id: '6',
    name: 'Camille Martin',
    email: 'camille.martin@example.com',
    phone: '+33 6 67 89 01 23',
    status: 'New',
    tags: ['No phone', 'Cold'],
    pipelineType: 'rental',
    taskType: 'Prospection'
  },
  {
    id: '7',
    name: 'Philippe Petit',
    email: 'philippe.petit@example.com',
    status: 'Contacted',
    tags: ['Hot'],
    assignedTo: 'Thomas Bernard',
    dueDate: 'Jun 19',
    pipelineType: 'rental',
    taskType: 'Estimation'
  }
];

const Kanban = () => {
  const [activeTab, setActiveTab] = useState<string>("purchase");
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Initialize filter state
  const [filters, setFilters] = useState<FilterOptions>({
    status: null,
    tags: [],
    assignedTo: null,
    minBudget: '',
    maxBudget: '',
    location: '',
    purchaseTimeframe: null,
    propertyType: null
  });

  // Get unique assigned users from all leads
  const assignedUsers = useMemo(() => {
    const allLeads = [...mockPurchaseLeads, ...mockRentalLeads];
    const users = allLeads
      .map(lead => lead.assignedTo)
      .filter((user): user is string => !!user);
    return [...new Set(users)];
  }, []);

  // Check if any filters are active
  const isFilterActive = useMemo(() => {
    return filters.status !== null || 
      filters.tags.length > 0 || 
      filters.assignedTo !== null || 
      filters.minBudget !== '' || 
      filters.maxBudget !== '' || 
      filters.location !== '' || 
      filters.purchaseTimeframe !== null || 
      filters.propertyType !== null;
  }, [filters]);

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      status: null,
      tags: [],
      assignedTo: null,
      minBudget: '',
      maxBudget: '',
      location: '',
      purchaseTimeframe: null,
      propertyType: null
    });
  };

  // Filter columns based on status if selected
  const getPurchaseColumns = () => {
    const statusesToShow = filters.status ? [filters.status] : [
      'New', 'Contacted', 'Qualified', 'Proposal', 'Visit', 'Offer', 'Deposit', 'Signed'
    ] as LeadStatus[];
    
    return statusesToShow.map(status => ({
      title: status,
      status: status as LeadStatus,
      items: mockPurchaseLeads.filter(lead => lead.status === status),
    }));
  };

  const getRentalColumns = () => {
    const statusesToShow = filters.status ? [filters.status] : [
      'New', 'Contacted', 'Qualified', 'Visit', 'Proposal', 'Offer', 'Signed'
    ] as LeadStatus[];
    
    return statusesToShow.map(status => ({
      title: status,
      status: status as LeadStatus,
      items: mockRentalLeads.filter(lead => lead.status === status),
    }));
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Pipeline</h1>
          <p className="text-muted-foreground text-sm md:text-base">Drag and drop leads through your sales stages</p>
        </div>
        
        {!isMobile && (
          <div className="flex space-x-3">
            <PipelineFilters 
              filters={filters}
              onFilterChange={setFilters}
              onClearFilters={handleClearFilters}
              assignedToOptions={assignedUsers}
              isFilterActive={isFilterActive}
            />
            <CustomButton
              variant="outline"
              className="flex items-center gap-1.5"
            >
              <Settings className="h-4 w-4" /> Customize
            </CustomButton>
            <CustomButton 
              variant="chocolate" 
              className="flex items-center gap-1.5"
              onClick={() => navigate('/leads/new')}
            >
              <Plus className="h-4 w-4" /> New Lead
            </CustomButton>
          </div>
        )}

        {isMobile && (
          <PipelineFilters 
            filters={filters}
            onFilterChange={setFilters}
            onClearFilters={handleClearFilters}
            assignedToOptions={assignedUsers}
            isFilterActive={isFilterActive}
          />
        )}
      </div>

      {/* Display active filters */}
      {isFilterActive && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground mr-1">Filtres actifs:</span>
          
          {filters.status && (
            <div className="bg-primary/10 text-primary text-xs rounded-full px-3 py-1 flex items-center gap-1">
              {filters.status}
              <button onClick={() => setFilters({...filters, status: null})}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </div>
          )}
          
          {filters.tags.map(tag => (
            <div key={tag} className="flex items-center">
              <TagBadge tag={tag} className="text-xs" />
              <button 
                onClick={() => setFilters({...filters, tags: filters.tags.filter(t => t !== tag)})}
                className="ml-1 bg-background rounded-full w-4 h-4 flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          
          {filters.assignedTo && (
            <div className="bg-primary/10 text-primary text-xs rounded-full px-3 py-1 flex items-center gap-1">
              {filters.assignedTo}
              <button onClick={() => setFilters({...filters, assignedTo: null})}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </div>
          )}
          
          {(filters.minBudget || filters.maxBudget) && (
            <div className="bg-primary/10 text-primary text-xs rounded-full px-3 py-1 flex items-center gap-1">
              Budget: {filters.minBudget ? `${filters.minBudget}€` : '0€'} - {filters.maxBudget ? `${filters.maxBudget}€` : '∞'}
              <button onClick={() => setFilters({...filters, minBudget: '', maxBudget: ''})}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </div>
          )}
          
          {filters.location && (
            <div className="bg-primary/10 text-primary text-xs rounded-full px-3 py-1 flex items-center gap-1">
              {filters.location}
              <button onClick={() => setFilters({...filters, location: ''})}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </div>
          )}
          
          {filters.purchaseTimeframe && (
            <div className="bg-primary/10 text-primary text-xs rounded-full px-3 py-1 flex items-center gap-1">
              {filters.purchaseTimeframe === 'Moins de trois mois' ? '< 3 mois' : '> 3 mois'}
              <button onClick={() => setFilters({...filters, purchaseTimeframe: null})}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </div>
          )}
          
          {filters.propertyType && (
            <div className="bg-primary/10 text-primary text-xs rounded-full px-3 py-1 flex items-center gap-1">
              {filters.propertyType}
              <button onClick={() => setFilters({...filters, propertyType: null})}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </div>
          )}
          
          {isFilterActive && (
            <button 
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={handleClearFilters}
            >
              Tout effacer
            </button>
          )}
        </div>
      )}

      <Tabs defaultValue="purchase" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 md:mb-6 w-full md:w-[400px] mx-auto">
          <TabsTrigger value="purchase" className="flex items-center gap-2 w-1/2">
            <Home className="h-4 w-4" />
            <span className="truncate">Achat (Purchase)</span>
          </TabsTrigger>
          <TabsTrigger value="rental" className="flex items-center gap-2 w-1/2">
            <Key className="h-4 w-4" />
            <span className="truncate">Location (Rental)</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="purchase" className="mt-0">
          <KanbanBoard columns={getPurchaseColumns()} filters={filters} />
        </TabsContent>
        
        <TabsContent value="rental" className="mt-0">
          <KanbanBoard columns={getRentalColumns()} filters={filters} />
        </TabsContent>
      </Tabs>

      {isMobile && (
        <FloatingActionButtons
          onAddAction={() => navigate('/leads/new')}
        />
      )}
    </div>
  );
};

export default Kanban;
