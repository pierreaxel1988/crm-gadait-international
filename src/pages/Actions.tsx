
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import { Button } from '@/components/ui/button';
import { Filter, Plus, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import ActionsList from '@/components/actions/ActionsList';
import { useBreakpoint } from '@/hooks/use-mobile';
import { useActionsData } from '@/hooks/useActionsData';
import AgentFilterButtons from '@/components/actions/filters/AgentFilterButtons';
import { useAuth } from '@/hooks/useAuth';

const Actions = () => {
  const { isMobile } = useBreakpoint();
  const { isAdmin, isCommercial } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [agentFilter, setAgentFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const { actions, isLoading, markActionComplete, teamMembers } = useActionsData(refreshTrigger);
  
  // Filter actions based on search term and agent
  const filteredActions = actions.filter(action => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matches = (
        action.leadName.toLowerCase().includes(searchLower) ||
        action.notes?.toLowerCase().includes(searchLower) ||
        action.assignedToName.toLowerCase().includes(searchLower)
      );
      if (!matches) return false;
    }
    
    // Agent filter
    if (agentFilter && action.assignedToId !== agentFilter) {
      return false;
    }
    
    return true;
  });
  
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (agentFilter) count++;
    return count;
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
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-10 w-full md:w-[280px] border-gray-300 focus:border-loro-terracotta"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                {isAdmin && !isCommercial && (
                  <Button 
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 ${getActiveFiltersCount() > 0 ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
                  >
                    <Filter className="h-4 w-4" />
                    Filtres
                    {getActiveFiltersCount() > 0 && (
                      <span className="ml-1 h-5 w-5 rounded-full bg-white text-primary flex items-center justify-center text-xs">
                        {getActiveFiltersCount()}
                      </span>
                    )}
                  </Button>
                )}
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

          {showFilters && isAdmin && !isCommercial && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <AgentFilterButtons
                agentFilter={agentFilter}
                setAgentFilter={setAgentFilter}
                teamMembers={teamMembers}
              />
              <div className="flex justify-end mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setAgentFilter(null);
                    setShowFilters(false);
                  }}
                  className="mr-2"
                >
                  Réinitialiser
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => setShowFilters(false)}
                >
                  Appliquer
                </Button>
              </div>
            </div>
          )}
          
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
