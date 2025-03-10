
import React from 'react';
import { getLeads } from '@/services/leadService';

const LeadSourcesTable = () => {
  // Obtenir tous les leads
  const allLeads = getLeads();
  
  // Compter les leads par source
  const sourceCounts: Record<string, number> = {};
  allLeads.forEach(lead => {
    const source = lead.source || 'Non spécifié';
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
  });
  
  // Transformer en tableau pour l'affichage et calculer les pourcentages
  const totalLeads = allLeads.length;
  const sourceData = Object.entries(sourceCounts)
    .map(([source, count]) => ({
      source,
      count,
      percentage: totalLeads > 0 ? (count / totalLeads * 100).toFixed(1) : '0'
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="relative w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Source</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nombre</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Pourcentage</th>
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {sourceData.map((item, index) => (
            <tr 
              key={index}
              className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
            >
              <td className="p-4 align-middle">{item.source}</td>
              <td className="p-4 align-middle">{item.count}</td>
              <td className="p-4 align-middle">
                <div className="flex items-center gap-2">
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span>{item.percentage}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadSourcesTable;
