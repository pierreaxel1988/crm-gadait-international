import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Filter, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePipelineState } from '@/hooks/usePipelineState';
import FullPageFilters from '@/components/pipeline/FullPageFilters';

const PipelineFiltersPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'purchase';
  
  const {
    filters,
    handleFilterChange,
    handleClearFilters,
    teamMembers,
    activeFiltersCount,
    isFilterActive
  } = usePipelineState();

  const handleApplyFilters = () => {
    navigate(`/pipeline?tab=${currentTab}`);
  };

  const handleBack = () => {
    navigate(`/pipeline?tab=${currentTab}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-primary" />
                <h1 className="text-2xl font-semibold">Filtres avancés</h1>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="gap-2"
                disabled={activeFiltersCount === 0}
              >
                <RotateCcw className="h-4 w-4" />
                Tout effacer
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <FullPageFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          assignedToOptions={teamMembers}
          isFilterActive={isFilterActive}
          onApplyFilters={handleApplyFilters}
        />
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {activeFiltersCount > 0 ? (
              `${activeFiltersCount} filtre${activeFiltersCount > 1 ? 's' : ''} appliqué${activeFiltersCount > 1 ? 's' : ''}`
            ) : (
              'Aucun filtre appliqué'
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleBack}>
              Annuler
            </Button>
            <Button onClick={handleApplyFilters} className="gap-2">
              <Filter className="h-4 w-4" />
              Appliquer les filtres
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineFiltersPage;