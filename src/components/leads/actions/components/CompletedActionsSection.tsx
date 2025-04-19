
import React from 'react';
import { Check } from 'lucide-react';
import { ActionHistory } from '@/types/actionHistory';
import CompletedActionCard from './CompletedActionCard';

interface CompletedActionsSectionProps {
  actions: ActionHistory[];
}

const CompletedActionsSection: React.FC<CompletedActionsSectionProps> = ({ actions }) => {
  if (actions.length === 0) return null;
  
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
          <Check className="h-4 w-4 text-gray-600" />
        </div>
        <div>
          <h3 className="text-sm font-futura text-gray-600">Actions terminées</h3>
          <p className="text-xs text-gray-500">{actions.length} actions</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {actions.map(action => (
          <CompletedActionCard key={action.id} action={action} />
        ))}
      </div>
    </div>
  );
};

export default CompletedActionsSection;
