
import React, { useState } from 'react';
import { Filter, Plus, Settings, RefreshCcw, Mail } from 'lucide-react';
import CustomButton from '@/components/ui/CustomButton';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import PipelineFilters, { FilterOptions } from '@/components/pipeline/PipelineFilters';
import EmailImportModal from './EmailImportModal';

interface PipelineHeaderProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  teamMembers: {id: string, name: string}[];
  isFilterActive: boolean;
  handleRefresh: () => void;
  isRefreshing: boolean;
}

const PipelineHeader = ({
  filters,
  onFilterChange,
  onClearFilters,
  teamMembers,
  isFilterActive,
  handleRefresh,
  isRefreshing
}: PipelineHeaderProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Pipeline</h1>
          <p className="text-muted-foreground text-sm md:text-base">Drag and drop leads through your sales stages</p>
        </div>
        
        {!isMobile && (
          <div className="flex space-x-3">
            <CustomButton
              variant="outline"
              className="flex items-center gap-1.5"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} /> 
              Actualiser
            </CustomButton>
            <CustomButton
              variant="outline"
              className="flex items-center gap-1.5"
              onClick={() => setIsEmailModalOpen(true)}
            >
              <Mail className="h-4 w-4" /> Importer un email
            </CustomButton>
            <PipelineFilters 
              filters={filters}
              onFilterChange={onFilterChange}
              onClearFilters={onClearFilters}
              assignedToOptions={teamMembers}
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
          <div className="flex space-x-2">
            <CustomButton
              variant="outline"
              className="flex items-center justify-center w-10 h-10 p-0"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </CustomButton>
            <CustomButton
              variant="outline"
              className="flex items-center justify-center w-10 h-10 p-0"
              onClick={() => setIsEmailModalOpen(true)}
            >
              <Mail className="h-4 w-4" />
            </CustomButton>
            <PipelineFilters 
              filters={filters}
              onFilterChange={onFilterChange}
              onClearFilters={onClearFilters}
              assignedToOptions={teamMembers}
              isFilterActive={isFilterActive}
            />
          </div>
        )}
      </div>

      <EmailImportModal 
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        teamMembers={teamMembers}
        onLeadCreated={handleRefresh}
      />
    </div>
  );
};

export default PipelineHeader;
