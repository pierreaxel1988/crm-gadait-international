
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
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2 px-1">
        <div className="h-6 w-6 rounded-full bg-gray-50 flex items-center justify-center">
          <Check className="h-3.5 w-3.5 text-gray-500" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600">Actions terminées</h3>
          <p className="text-xs text-gray-400">{actions.length} actions</p>
        </div>
      </div>
      
      <div className="space-y-2.5">
        {actions.map(action => (
          <CompletedActionCard key={action.id} action={action} />
        ))}
      </div>
    </div>
  );
};

export default CompletedActionsSection;
