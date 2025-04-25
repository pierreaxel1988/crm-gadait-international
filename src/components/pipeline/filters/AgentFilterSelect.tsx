
import React from 'react';
import TeamMemberSelect from '@/components/leads/TeamMemberSelect';

interface AgentFilterSelectProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

const AgentFilterSelect: React.FC<AgentFilterSelectProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Responsable du suivi</h4>
      <TeamMemberSelect
        value={value || undefined}
        onChange={onChange}
        placeholder="Filtrer par agent"
      />
    </div>
  );
};

export default AgentFilterSelect;
