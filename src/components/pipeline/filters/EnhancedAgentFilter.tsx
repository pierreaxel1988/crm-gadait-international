import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, User } from 'lucide-react';

interface EnhancedAgentFilterProps {
  assignedTo: string | null;
  onAssignedToChange: (agent: string | null) => void;
  assignedToOptions: {
    id: string;
    name: string;
  }[];
}

const EnhancedAgentFilter = ({ assignedTo, onAssignedToChange, assignedToOptions }: EnhancedAgentFilterProps) => {
  const selectedAgent = assignedToOptions.find(agent => agent.id === assignedTo);

  const allOptions = [
    { id: null, name: 'Tous les agents' },
    ...assignedToOptions
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-5 w-5 text-primary" />
        <h4 className="font-medium text-foreground">Agent assigné</h4>
        {selectedAgent && (
          <Badge variant="secondary" className="text-xs">
            {selectedAgent.name}
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {allOptions.map((agent) => {
          const isSelected = assignedTo === agent.id;
          
          return (
            <Button
              key={agent.id || 'all'}
              variant={isSelected ? "default" : "outline"}
              size="lg"
              className={`h-auto p-4 flex items-center gap-3 justify-start transition-all duration-200 ${
                isSelected 
                  ? 'shadow-md border-primary/50' 
                  : 'hover:border-primary/30 hover:shadow-sm'
              }`}
              onClick={() => onAssignedToChange(agent.id)}
            >
              {agent.id ? (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getInitials(agent.name)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  isSelected ? 'bg-primary-foreground/20' : 'bg-muted'
                }`}>
                  <User className={`h-4 w-4 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                </div>
              )}
              
              <span className={`font-medium ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                {agent.name}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default EnhancedAgentFilter;