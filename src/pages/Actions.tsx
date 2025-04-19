
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import { Button } from '@/components/ui/button';
import { Check, Filter, Plus, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import ActionsList from '@/components/actions/ActionsList';
import { useBreakpoint } from '@/hooks/use-mobile';
import { useActionsData } from '@/hooks/useActionsData';
import { useAuth } from '@/hooks/useAuth';
import { useSelectedAgent } from '@/hooks/useSelectedAgent';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Actions = () => {
  const { isMobile } = useBreakpoint();
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { actions, isLoading, markActionComplete } = useActionsData(refreshTrigger);
  const { isAdmin } = useAuth();
  const { selectedAgent, handleAgentChange } = useSelectedAgent();
  
  // Filter actions based on search term and selected agent
  const filteredActions = actions.filter(action => {
    if (!searchTerm && !selectedAgent) return true;
    
    let matchesSearch = true;
    let matchesAgent = true;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      matchesSearch = action.leadName.toLowerCase().includes(searchLower) ||
        action.notes?.toLowerCase().includes(searchLower) ||
        action.assignedToName.toLowerCase().includes(searchLower);
    }
    
    if (selectedAgent) {
      matchesAgent = action.assignedToId === selectedAgent;
    }
    
    return matchesSearch && matchesAgent;
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
              
              {isAdmin && (
                <Select value={selectedAgent || "all"} onValueChange={(value) => handleAgentChange(value === "all" ? null : value)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtrer par commercial" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les commerciaux</SelectItem>
                    {actions
                      .reduce((acc: { id: string; name: string }[], curr) => {
                        if (curr.assignedToId && curr.assignedToName && 
                            !acc.some(agent => agent.id === curr.assignedToId)) {
                          acc.push({ id: curr.assignedToId, name: curr.assignedToName });
                        }
                        return acc;
                      }, [])
                      .map(agent => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))
                    }
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
