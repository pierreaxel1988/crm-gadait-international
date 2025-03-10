
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody } from "@/components/ui/table";
import { agentsDataByPeriod, PeriodType } from './agentsData';
import PeriodSelector from './PeriodSelector';
import AgentsTableHeader from './AgentsTableHeader';
import AgentTableRow from './AgentTableRow';

const TopAgentsTable = () => {
  const [period, setPeriod] = useState<PeriodType>('mois');
  
  // Sélection des données en fonction de la période
  const agentsData = agentsDataByPeriod[period];
  
  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle>Top Agents Commerciaux</CardTitle>
        <PeriodSelector period={period} setPeriod={setPeriod} />
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <AgentsTableHeader />
          <TableBody>
            {agentsData.map((agent) => (
              <AgentTableRow key={agent.name} agent={agent} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TopAgentsTable;
