
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

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

  const handleAddLead = () => {
    navigate(`/leads/new?pipeline=${activeTab}`);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-futura">Actions rapides</h3>
      <div className="grid gap-2">
        <Button onClick={handleAddLead} className="w-full justify-start font-futura">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau lead
        </Button>
        <Button variant="outline" onClick={handleRefresh} className="w-full justify-start font-futura">
          {isRefreshing ? "Rafraîchissement..." : "Rafraîchir les données"}
        </Button>
      </div>
    </div>
  );
};

export default MobileActionsDrawer;
