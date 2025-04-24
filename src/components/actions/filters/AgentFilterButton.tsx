
import React from 'react';
import { Button } from '@/components/ui/button';

interface AgentFilterButtonProps {
  memberId: string;
  memberName: string;
  isSelected: boolean;
  onClick: () => void;
}

const AgentFilterButton: React.FC<AgentFilterButtonProps> = ({
  memberId,
  memberName,
  isSelected,
  onClick,
}) => {
  return (
    <Button
      key={memberId}
      variant={isSelected ? "default" : "outline"}
      size="sm"
      className="text-xs whitespace-normal h-auto py-1.5"
      onClick={onClick}
    >
      {memberName}
    </Button>
  );
};

export default AgentFilterButton;
