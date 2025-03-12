
import React from 'react';

interface Parameter {
  name: string;
  description: string;
}

interface ParametersTableProps {
  title: string;
  parameters: Parameter[];
}

const ParametersTable = ({ title, parameters }: ParametersTableProps) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-2 px-4 text-left">Champ</th>
            <th className="py-2 px-4 text-left">Description</th>
          </tr>
        </thead>
        <tbody>
          {parameters.map((param, index) => (
            <tr key={index} className="border-b">
              <td className="py-2 px-4"><code>{param.name}</code></td>
              <td className="py-2 px-4">{param.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ParametersTable;
