
import React, { useState, useEffect } from 'react';
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
import TagFilterButtons, { TagFilterValue } from '@/components/actions/filters/TagFilterButtons';
import { TaskType } from '@/components/kanban/KanbanCard';
import ActionsList from '@/components/actions/ActionsList';
import { useDebounce } from '@/hooks/useDebounce';
import PipelineSearchBar from '@/components/pipeline/PipelineSearchBar';
import { GUARANTEED_TEAM_MEMBERS } from '@/services/teamMemberService';
import { LeadTag } from '@/components/common/TagBadge';

const Actions = () => {
  const { isMobile } = useBreakpoint();
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { actions, isLoading, markActionComplete } = useActionsData(refreshTrigger);
  const { isAdmin } = useAuth();
  const { selectedAgent, handleAgentChange } = useSelectedAgent();
  const [typeFilter, setTypeFilter] = useState<TaskType | 'all'>('all');
  const [selectedTags, setSelectedTags] = useState<TagFilterValue[]>([]);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredActions = React.useMemo(() => {
    return actions.filter(action => {
      if (!debouncedSearchTerm && !selectedAgent && typeFilter === 'all' && selectedTags.length === 0) return true;

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
      
      // Match tags - handle "no-tags" special case and regular tags
      let matchesTags = true;
      if (selectedTags.length > 0) {
        const hasNoTagsFilter = selectedTags.includes('no-tags');
        const regularTags = selectedTags.filter(t => t !== 'no-tags') as LeadTag[];
        const leadHasNoTags = !action.leadTags || action.leadTags.length === 0;
        const leadHasSelectedTag = action.leadTags && action.leadTags.some(tag => regularTags.includes(tag as LeadTag));
        
        matchesTags = (hasNoTagsFilter && leadHasNoTags) || (regularTags.length > 0 && leadHasSelectedTag);
      }

      return matchesSearch && matchesAgent && matchesType && matchesTags;
    });
  }, [actions, debouncedSearchTerm, selectedAgent, typeFilter, selectedTags]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <Navbar />
      <SubNavigation />
      <div className="p-4 md:p-6 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Show page structure immediately */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-futuraLight tracking-wide text-loro-navy">Actions</h1>
            
            <div className="flex flex-col md:flex-row gap-3">
              <div className="w-full md:w-[280px]">
                <PipelineSearchBar
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  placeholder="Rechercher une action par lead, email, téléphone..."
                />
              </div>
              
              {isAdmin && (
                <Select value={selectedAgent || "all"} onValueChange={(value) => handleAgentChange(value === "all" ? null : value)}>
                  <SelectTrigger className="w-[200px] text-xs">
                    <SelectValue placeholder="Filtrer par commercial" />
                  </SelectTrigger>
                  <SelectContent searchable>
                    <SelectItem value="all">Tous les commerciaux</SelectItem>
                    {GUARANTEED_TEAM_MEMBERS.map(agent => (
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

          <div className="mb-4 space-y-4">
            <TypeFilterButtons typeFilter={typeFilter} setTypeFilter={setTypeFilter} />
            <TagFilterButtons selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
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

