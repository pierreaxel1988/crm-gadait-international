
import React from 'react';
import { getTeamMemberById } from '@/services/teamMemberService';
import { User, UserPlus } from 'lucide-react';

interface AssignedUserProps {
  assignedToId?: string;
  onAssignClick: (e: React.MouseEvent) => void;
}

const AssignedUser = ({ assignedToId, onAssignClick }: AssignedUserProps) => {
  // Using getTeamMemberById directly since it's synchronous and contains the guaranteed team members
  const assignedTeamMember = assignedToId ? getTeamMemberById(assignedToId) : undefined;

  if (assignedTeamMember) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-gray-600">
        <User className="h-3.5 w-3.5" />
        <span>Responsable: {assignedTeamMember.name}</span>
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
