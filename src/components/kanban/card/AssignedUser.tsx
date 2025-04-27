
import React, { useEffect, useState } from 'react';
import { getTeamMemberById } from '@/services/teamMemberService';
import { User, UserPlus } from 'lucide-react';

interface AssignedUserProps {
  assignedToId?: string;
  onAssignClick: (e: React.MouseEvent) => void;
}

const AssignedUser = ({ assignedToId, onAssignClick }: AssignedUserProps) => {
  const [assignedUserName, setAssignedUserName] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    if (assignedToId) {
      const teamMember = getTeamMemberById(assignedToId);
      setAssignedUserName(teamMember?.name);
    }
  }, [assignedToId]);

  if (assignedToId && assignedUserName) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-gray-600">
        <User className="h-3.5 w-3.5" />
        <span>{assignedUserName}</span>
      </div>
    );
  }

  return (
    <button 
      onClick={onAssignClick}
      className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600"
    >
      <UserPlus className="h-3.5 w-3.5" />
      <span>Assigner</span>
    </button>
  );
};

export default AssignedUser;
