import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { useBreakpoint } from '@/hooks/use-mobile';
import { useActionsData } from '@/hooks/useActionsData';
import { useAuth } from '@/hooks/useAuth';
import { useSelectedAgent } from '@/hooks/useSelectedAgent';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TypeFilterButtons from '@/components/actions/filters/TypeFilterButtons';
import { TaskType } from '@/components/kanban/KanbanCard';
import ActionsList from '@/components/actions/ActionsList';
import { useDebounce } from '@/hooks/useDebounce';
import PipelineSearchBar from '@/components/pipeline/PipelineSearchBar';

const GUARANTEED_TEAM = [
  { id: "e59037a6-218d-4504-a3ad-d2c399784dc7", name: "Jacques Charles", role: "agent" },
  { id: "ccbc635f-0282-427b-b130-82c1f0fbdbf9", name: "Pierre-Axel Gadait", role: "admin" },
  { id: "acab847b-7ace-4681-989d-86f78549aa69", name: "Jade Diouane", role: "agent" },
  { id: "af8e053c-8fae-4424-abaa-d79029fd8a11", name: "Jean Marc Perrissol", role: "agent" },
  { id: "e564a874-2520-4167-bfa8-26d39f119470", name: "Sharon Ramdiane", role: "agent" },
  { id: "06e60e2c-4835-4d19-bdf1-5d06f5d2b7e9", name: "Christelle Gadait", role: "admin" },
  { id: "28c03acf-cb78-46b7-8dba-c1edee49c932", name: "Chloe Valentin", role: "admin" },
  { id: "af1c9117-f94f-44d0-921f-776dd5fd6f96", name: "Christine Francoise", role: "admin" },
  { id: "2d8bae00-a935-439d-8685-0adf238a612e", name: "Ophelie Durand", role: "agent" }
];

const Actions = () => {
  const { isMobile } = useBreakpoint();
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { actions, isLoading, markActionComplete } = useActionsData(refreshTrigger);
  const { isAdmin } = useAuth();
  const { selectedAgent, handleAgentChange } = useSelectedAgent();
  const [typeFilter, setTypeFilter] = useState<TaskType | 'all'>('all');
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const guaranteedTeamMembers = useMemo(() => {
    const guaranteedIds = new Set(GUARANTEED_TEAM.map(member => member.id));
    const existingIds = new Set(actions.map(action => action.assignedToId));
    
    const allMembers = [...GUARANTEED_TEAM];
    
    actions.forEach(action => {
      if (action.assignedToId && action.assignedToName && !guaranteedIds.has(action.assignedToId)) {
        allMembers.push({
          id: action.assignedToId,
          name: action.assignedToName,
          role: "agent"
        });
      }
    });
    
    return allMembers.sort((a, b) => a.name.localeCompare(b.name));
  }, [actions]);

  const filteredActions = useMemo(() => {
    return actions.filter(action => {
      if (!debouncedSearchTerm && !selectedAgent && typeFilter === 'all') return true;

      const searchLower = debouncedSearchTerm.toLowerCase();
      
      const matchesSearch = !debouncedSearchTerm || (
        action.leadName?.toLowerCase().includes(searchLower) ||
        action.notes?.toLowerCase().includes(searchLower) ||
        action.assignedToName?.toLowerCase().includes(searchLower) ||
        action.actionType?.toLowerCase().includes(searchLower) ||
        action.email?.toLowerCase().includes(searchLower) ||
        action.phoneNumber?.toLowerCase().includes(searchLower)
      );
      
      const matchesAgent = !selectedAgent || action.assignedToId === selectedAgent;
      const matchesType = typeFilter === 'all' || action.actionType === typeFilter;

      return matchesSearch && matchesAgent && matchesType;
    });
  }, [actions, debouncedSearchTerm, selectedAgent, typeFilter]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <Navbar />
      <SubNavigation />
      <div className="p-4 md:p-6 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-futuraLight tracking-wide text-loro-navy">Actions</h1>
            
            <div className="flex flex-col md:flex-row gap-3">
              <div className="w-full md:w-[280px]">
                <PipelineSearchBar
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onRefresh={handleRefresh}
                />
              </div>
              
              {isAdmin && (
                <Select value={selectedAgent || "all"} onValueChange={(value) => handleAgentChange(value === "all" ? null : value)}>
                  <SelectTrigger className="w-[200px] text-xs">
                    <SelectValue placeholder="Filtrer par commercial" />
                  </SelectTrigger>
                  <SelectContent searchable>
                    <SelectItem value="all">Tous les commerciaux</SelectItem>
                    {guaranteedTeamMembers.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="default" 
                  className="flex-shrink-0"
                  onClick={handleRefresh}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Rafraîchir
                </Button>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <TypeFilterButtons typeFilter={typeFilter} setTypeFilter={setTypeFilter} />
          </div>
          
          <ActionsList 
            actions={filteredActions}
            isLoading={isLoading}
            onMarkComplete={markActionComplete}
            isMobile={isMobile}
          />
        </div>
      </div>
    </>
  );
};

export default Actions;
