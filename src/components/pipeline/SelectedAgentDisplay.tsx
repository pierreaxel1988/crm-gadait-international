
import React from 'react';

interface SelectedAgentDisplayProps {
  agentName: string | null;
}

const SelectedAgentDisplay: React.FC<SelectedAgentDisplayProps> = ({ agentName }) => {
  if (!agentName) return null;

  return (
    <div className="mb-4 text-sm bg-gradient-to-r from-gray-50 to-white p-2.5 rounded-lg text-center border border-gray-100 shadow-sm">
      <span className="font-medium">Commercial sélectionné :</span>{" "}
      <span className="text-primary font-semibold">{agentName}</span>
    </div>
  );
};

export default SelectedAgentDisplay;
