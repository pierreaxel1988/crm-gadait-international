
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import ActionsList from '@/components/actions/ActionsList';
import { useBreakpoint } from '@/hooks/use-mobile';
import { useActionsData } from '@/hooks/useActionsData';
import { ActionStatus, TaskType } from '@/types/actionHistory';
import StatusFilterButtons from '@/components/actions/filters/StatusFilterButtons';
import TypeFilterButtons from '@/components/actions/filters/TypeFilterButtons';
import AgentFilterButtons from '@/components/actions/filters/AgentFilterButtons';

const Actions = () => {
  const { isMobile } = useBreakpoint();
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [statusFilter, setStatusFilter] = useState<ActionStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<TaskType | 'all'>('all');
  const [agentFilter, setAgentFilter] = useState('all');
  
  const { actions, isLoading, markActionComplete } = useActionsData(refreshTrigger);
  
  // Filter actions based on search term and filters
  const filteredActions = actions.filter(action => {
    // Filter by search term
    const matchesSearch = !searchTerm ? true : (
      action.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.assignedToName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Filter by status
    const matchesStatus = statusFilter === 'all' ? true : action.status === statusFilter;
    
    // Filter by type
    const matchesType = typeFilter === 'all' ? true : action.actionType === typeFilter;
    
    // Filter by agent
    const matchesAgent = agentFilter === 'all' ? true : action.assignedToId === agentFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesAgent;
  });
  
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
          
          <div className="flex flex-wrap gap-4 mb-6">
            <StatusFilterButtons 
              value={statusFilter} 
              onChange={(value) => setStatusFilter(value as ActionStatus | 'all')}
            />
            
            <TypeFilterButtons 
              value={typeFilter}
              onChange={(value) => setTypeFilter(value as TaskType | 'all')}
            />
            
            <AgentFilterButtons
              value={agentFilter}
              onChange={setAgentFilter}
            />
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
