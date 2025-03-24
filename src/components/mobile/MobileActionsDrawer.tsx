
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCcw, Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileActionsDrawerProps {
  activeTab: string;
  handleRefresh: () => void;
  isRefreshing: boolean;
}

const MobileActionsDrawer = ({ 
  activeTab, 
  handleRefresh,
  isRefreshing
}: MobileActionsDrawerProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center py-2">
        <h3 className="text-base font-medium">Actions</h3>
      </div>
      
      <Button 
        variant="default" 
        className="w-full flex items-center justify-center gap-2"
        onClick={() => navigate(`/leads/new?pipeline=${activeTab}`)}
      >
        <Plus className="h-4 w-4" />
        Nouveau lead
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full flex items-center justify-center gap-2"
        onClick={() => navigate('/lead-import')}
      >
        <Download className="h-4 w-4" />
        Importer des leads
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full flex items-center justify-center gap-2"
        onClick={handleRefresh}
        disabled={isRefreshing}
      >
        <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        Rafraîchir les données
      </Button>
    </div>
  );
};

export default MobileActionsDrawer;
