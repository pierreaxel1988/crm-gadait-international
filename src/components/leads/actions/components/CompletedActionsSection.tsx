
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
    <div className="mt-3 w-full overflow-x-hidden">
      <div className="flex items-center gap-1.5 mb-1.5 px-1">
        <div className="h-5 w-5 rounded-full bg-gray-50 flex items-center justify-center">
          <Check className="h-3 w-3 text-gray-500" />
        </div>
        <div>
          <h3 className="text-xs font-medium text-gray-600">Actions terminées</h3>
          <p className="text-[10px] text-gray-400">{actions.length} actions</p>
        </div>
      </div>
      
      <div className="space-y-1.5 w-full">
        {actions.map(action => (
          <CompletedActionCard key={action.id} action={action} />
        ))}
      </div>
    </div>
  );
};

export default CompletedActionsSection;
