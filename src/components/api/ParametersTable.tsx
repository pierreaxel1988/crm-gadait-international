
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Parameter {
  name: string;
  description: string;
}

interface ParametersTableProps {
  title: string;
  parameters: Parameter[];
}

const ParametersTable = ({ title, parameters }: ParametersTableProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm md:text-base">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-2 md:px-4 text-left font-medium">Champ</th>
              <th className="py-2 px-2 md:px-4 text-left font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {parameters.map((param, index) => (
              <tr key={index} className="border-b">
                <td className="py-2 px-2 md:px-4 align-top">
                  <code className="text-xs md:text-sm break-all bg-muted px-1 py-0.5 rounded">{param.name}</code>
                </td>
                <td className="py-2 px-2 md:px-4 text-sm md:text-base">{param.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParametersTable;
