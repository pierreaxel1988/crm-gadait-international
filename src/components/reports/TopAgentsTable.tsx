
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ArrowUp, ArrowDown, Calendar, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const TopAgentsTable = () => {
  const [period, setPeriod] = useState<'semaine' | 'mois' | 'annee'>('mois');
  
  // Données mockées pour le tableau des agents avec différentes périodes
  const agentsDataByPeriod = {
    semaine: [
      { 
        name: 'Jade Diouane',
        leads: 5, 
        sales: 1, 
        value: '€1.2M', 
        conversion: 30,
        change: 10
      },
      { 
        name: 'Ophelie Durand',
        leads: 4, 
        sales: 1, 
        value: '€0.9M', 
        conversion: 25,
        change: 5
      },
      { 
        name: 'Jean Marc Perrissol',
        leads: 3, 
        sales: 0, 
        value: '€0M', 
        conversion: 0,
        change: -2
      },
      { 
        name: 'Jacques Charles',
        leads: 3, 
        sales: 1, 
        value: '€0.7M', 
        conversion: 33,
        change: 15
      },
      { 
        name: 'Sharon Ramdiane',
        leads: 2, 
        sales: 0, 
        value: '€0M', 
        conversion: 0,
        change: -5
      },
    ],
    mois: [
      { 
        name: 'Jade Diouane',
        leads: 12, 
        sales: 3, 
        value: '€4.8M', 
        conversion: 32,
        change: 15
      },
      { 
        name: 'Ophelie Durand',
        leads: 10, 
        sales: 2, 
        value: '€3.2M', 
        conversion: 28,
        change: 8
      },
      { 
        name: 'Jean Marc Perrissol',
        leads: 8, 
        sales: 2, 
        value: '€2.9M', 
        conversion: 25,
        change: -4
      },
      { 
        name: 'Jacques Charles',
        leads: 9, 
        sales: 1, 
        value: '€2.5M', 
        conversion: 20,
        change: 12
      },
      { 
        name: 'Sharon Ramdiane',
        leads: 7, 
        sales: 1, 
        value: '€1.9M', 
        conversion: 18,
        change: -2
      },
    ],
    annee: [
      { 
        name: 'Jade Diouane',
        leads: 48, 
        sales: 12, 
        value: '€18.5M', 
        conversion: 35,
        change: 20
      },
      { 
        name: 'Ophelie Durand',
        leads: 42, 
        sales: 10, 
        value: '€15.8M', 
        conversion: 30,
        change: 12
      },
      { 
        name: 'Jean Marc Perrissol',
        leads: 38, 
        sales: 9, 
        value: '€14.2M', 
        conversion: 27,
        change: 5
      },
      { 
        name: 'Jacques Charles',
        leads: 36, 
        sales: 8, 
        value: '€12.6M', 
        conversion: 25,
        change: 8
      },
      { 
        name: 'Sharon Ramdiane',
        leads: 30, 
        sales: 6, 
        value: '€9.8M', 
        conversion: 22,
        change: 3
      },
    ]
  };

  // Sélection des données en fonction de la période
  const agentsData = agentsDataByPeriod[period];

  // Texte à afficher pour la période
  const periodLabels = {
    semaine: "Cette semaine",
    mois: "Ce mois",
    annee: "Cette année"
  };
  
  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle>Top Agents Commerciaux</CardTitle>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[160px] justify-between border-gray-200 focus:ring-blue-200">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{periodLabels[period]}</span>
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="end">
            <div className="rounded-md overflow-hidden">
              {Object.entries(periodLabels).map(([key, label]) => (
                <div 
                  key={key}
                  className={cn(
                    "px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-100",
                    period === key && "bg-gray-100"
                  )}
                  onClick={() => {
                    setPeriod(key as 'semaine' | 'mois' | 'annee');
                  }}
                >
                  <span className="text-gray-800">{label}</span>
                  {period === key && <Check className="h-4 w-4 text-blue-600" />}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Agent</TableHead>
              <TableHead className="text-right whitespace-nowrap">Leads</TableHead>
              <TableHead className="text-right whitespace-nowrap">Ventes</TableHead>
              <TableHead className="text-right whitespace-nowrap">Valeur</TableHead>
              <TableHead className="text-right whitespace-nowrap">Conversion</TableHead>
              <TableHead className="text-right whitespace-nowrap">Tendance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agentsData.map((agent) => (
              <TableRow key={agent.name}>
                <TableCell className="font-medium whitespace-nowrap">{agent.name}</TableCell>
                <TableCell className="text-right font-medium">{agent.leads}</TableCell>
                <TableCell className="text-right">{agent.sales}</TableCell>
                <TableCell className="text-right">{agent.value}</TableCell>
                <TableCell className="text-right">{agent.conversion}%</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end">
                    <span 
                      className={cn(
                        "flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                        agent.change > 0 ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"
                      )}
                    >
                      {agent.change > 0 ? (
                        <ArrowUp className="mr-1 h-3 w-3" />
                      ) : (
                        <ArrowDown className="mr-1 h-3 w-3" />
                      )}
                      {Math.abs(agent.change)}%
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TopAgentsTable;
