
export type AgentData = {
  name: string;
  leads: number;
  sales: number;
  value: string;
  conversion: number;
  change: number;
};

export type PeriodType = 'semaine' | 'mois' | 'annee';

// Données mockées pour le tableau des agents avec différentes périodes
export const agentsDataByPeriod: Record<PeriodType, AgentData[]> = {
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
