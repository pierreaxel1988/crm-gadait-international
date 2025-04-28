
import React from 'react';
import { GUARANTEED_TEAM_MEMBERS } from '@/services/teamMemberService';

const TeamMembersPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-medium mb-4">Membres de l'équipe</h1>
      <div className="grid gap-4 mt-4">
        {GUARANTEED_TEAM_MEMBERS.map((member) => (
          <div key={member.id} className="p-4 border rounded shadow-sm">
            <h3 className="font-medium">{member.name}</h3>
            <p className="text-sm text-gray-500">{member.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamMembersPage;
