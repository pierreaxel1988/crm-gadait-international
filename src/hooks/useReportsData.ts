import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type PeriodType = 'semaine' | 'mois' | 'trimestre' | 'annee' | 'custom';

export const usePerformanceData = (period: string) => {
  const periodMap: Record<string, string> = {
    'week': 'semaine',
    'month': 'mois',
    'quarter': 'trimestre',
    'year': 'annee',
    'custom': 'custom'
  };

  const mappedPeriod = periodMap[period] || 'mois';

  return useQuery({
    queryKey: ['performance-data', mappedPeriod],
    queryFn: async () => {
      // Calculer la période en fonction du filtre sélectionné
      const now = new Date();
      let startDate = new Date();
      
      if (mappedPeriod === 'semaine') {
        startDate.setDate(now.getDate() - 7);
      } else if (mappedPeriod === 'mois') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (mappedPeriod === 'trimestre') {
        startDate.setMonth(now.getMonth() - 3);
      } else if (mappedPeriod === 'annee') {
        startDate.setFullYear(now.getFullYear() - 1);
      }
      
      // Récupérer les données de vente/performance depuis les leads conclus
      const { data: performanceData, error: performanceError } = await supabase
        .from('leads')
        .select('created_at, budget')
        .eq('status', 'Conclus')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });
        
      if (performanceError) {
        console.error('Erreur lors du chargement des données de performance:', performanceError);
        throw new Error(performanceError.message);
      }
      
      // Formater les données pour le graphique
      const formattedData = formatPerformanceData(performanceData || [], mappedPeriod);
      
      return formattedData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLeadsSourceData = (period: string) => {
  const periodMap: Record<string, string> = {
    'week': 'semaine',
    'month': 'mois',
    'quarter': 'trimestre',
    'year': 'annee',
    'custom': 'custom'
  };

  const mappedPeriod = periodMap[period] || 'mois';

  return useQuery({
    queryKey: ['leads-source-data', mappedPeriod],
    queryFn: async () => {
      // Calculer la période en fonction du filtre sélectionné
      const now = new Date();
      let startDate = new Date();
      
      if (mappedPeriod === 'semaine') {
        startDate.setDate(now.getDate() - 7);
      } else if (mappedPeriod === 'mois') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (mappedPeriod === 'trimestre') {
        startDate.setMonth(now.getMonth() - 3);
      } else if (mappedPeriod === 'annee') {
        startDate.setFullYear(now.getFullYear() - 1);
      }
      
      // Récupérer les leads par source
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('source')
        .gte('created_at', startDate.toISOString());
        
      if (leadsError) {
        console.error('Erreur lors du chargement des données de sources de leads:', leadsError);
        throw new Error(leadsError.message);
      }
      
      // Compter les leads par source
      const sourceCount: Record<string, number> = {};
      leadsData?.forEach(lead => {
        const source = lead.source || 'Inconnu';
        sourceCount[source] = (sourceCount[source] || 0) + 1;
      });
      
      // Formater pour le graphique
      const formattedData = Object.entries(sourceCount).map(([name, count]) => {
        return {
          name,
          value: Math.round((count / (leadsData?.length || 1)) * 100),
          count
        };
      });
      
      return formattedData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAgentPerformanceData = (period: string) => {
  const periodMap: Record<string, string> = {
    'week': 'semaine',
    'month': 'mois',
    'quarter': 'trimestre',
    'year': 'annee',
    'custom': 'custom'
  };

  const mappedPeriod = periodMap[period] || 'mois';

  return useQuery({
    queryKey: ['agent-performance', mappedPeriod],
    queryFn: async () => {
      // Calculer la période en fonction du filtre sélectionné
      const now = new Date();
      let startDate = new Date();
      let previousStartDate = new Date();
      
      if (mappedPeriod === 'semaine') {
        startDate.setDate(now.getDate() - 7);
        previousStartDate.setDate(now.getDate() - 14);
      } else if (mappedPeriod === 'mois') {
        startDate.setMonth(now.getMonth() - 1);
        previousStartDate.setMonth(now.getMonth() - 2);
      } else if (mappedPeriod === 'trimestre') {
        startDate.setMonth(now.getMonth() - 3);
        previousStartDate.setMonth(now.getMonth() - 6);
      } else if (mappedPeriod === 'annee') {
        startDate.setFullYear(now.getFullYear() - 1);
        previousStartDate.setFullYear(now.getFullYear() - 2);
      }
      
      // Récupérer les team members (agents)
      const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select('id, name')
        .eq('role', 'commercial');
        
      if (teamError) {
        console.error('Erreur lors du chargement des agents:', teamError);
        throw new Error(teamError.message);
      }
      
      // Pour chaque agent, récupérer ses leads et ses ventes
      const agentPerformance = await Promise.all(
        (teamMembers || []).map(async (member) => {
          // Récupérer tous les leads assignés à cet agent dans la période
          const { data: currentLeads, error: leadsError } = await supabase
            .from('leads')
            .select('id, status, budget')
            .eq('assigned_to', member.id)
            .gte('created_at', startDate.toISOString());
            
          if (leadsError) {
            console.error(`Erreur pour les leads de ${member.name}:`, leadsError);
            throw new Error(leadsError.message);
          }
          
          // Récupérer les leads de la période précédente pour calculer l'évolution
          const { data: previousLeads, error: prevLeadsError } = await supabase
            .from('leads')
            .select('id, status')
            .eq('assigned_to', member.id)
            .gte('created_at', previousStartDate.toISOString())
            .lt('created_at', startDate.toISOString());
            
          if (prevLeadsError) {
            console.error(`Erreur pour les leads précédents de ${member.name}:`, prevLeadsError);
          }
          
          // Calculer le nombre de ventes (leads avec statut "Conclus")
          const sales = currentLeads?.filter(lead => lead.status === 'Conclus').length || 0;
          const previousSales = previousLeads?.filter(lead => lead.status === 'Conclus').length || 1; // éviter division par zéro
          
          // Calculer la valeur totale des ventes
          let totalValue = 0;
          currentLeads?.forEach(lead => {
            if (lead.status === 'Conclus' && lead.budget) {
              // Extraire la valeur numérique du budget (qui peut être stocké sous différents formats)
              const budgetValue = extractNumericValue(lead.budget);
              totalValue += budgetValue;
            }
          });
          
          // Calculer le taux de conversion
          const leadsCount = currentLeads?.length || 0;
          const conversion = leadsCount > 0 ? Math.round((sales / leadsCount) * 100) : 0;
          
          // Calculer l'évolution par rapport à la période précédente
          const previousLeadsCount = previousLeads?.length || 1; // éviter division par zéro
          const leadsChange = Math.round(((leadsCount - previousLeadsCount) / previousLeadsCount) * 100);
          
          return {
            name: member.name,
            leads: leadsCount,
            sales: sales,
            value: formatCurrency(totalValue),
            conversion: conversion,
            change: leadsChange
          };
        })
      );
      
      return agentPerformance;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useConversionFunnelData = (period: string) => {
  const periodMap: Record<string, string> = {
    'week': 'semaine',
    'month': 'mois',
    'quarter': 'trimestre',
    'year': 'annee',
    'custom': 'custom'
  };

  const mappedPeriod = periodMap[period] || 'mois';

  return useQuery({
    queryKey: ['conversion-funnel', mappedPeriod],
    queryFn: async () => {
      // Calculer la période en fonction du filtre sélectionné
      const now = new Date();
      let startDate = new Date();
      
      if (mappedPeriod === 'semaine') {
        startDate.setDate(now.getDate() - 7);
      } else if (mappedPeriod === 'mois') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (mappedPeriod === 'trimestre') {
        startDate.setMonth(now.getMonth() - 3);
      } else if (mappedPeriod === 'annee') {
        startDate.setFullYear(now.getFullYear() - 1);
      }
      
      // Récupérer tous les leads de la période
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('status')
        .gte('created_at', startDate.toISOString());
        
      if (leadsError) {
        console.error('Erreur lors du chargement des données de conversion:', leadsError);
        throw new Error(leadsError.message);
      }
      
      // Définir les étapes du parcours de conversion et leur ordre
      const stages = [
        'Nouveaux', 
        'Contactés', 
        'Qualifiés', 
        'Propositions', 
        'Visites en cours',
        'Offre en cours',
        'Dépôt reçu',
        'Signature finale',
        'Conclus'
      ];
      
      // Mapper les statuts de leads aux étapes du funnel
      const statusToStage: Record<string, string> = {
        'Nouveau': 'Nouveaux',
        'Contacté': 'Contactés',
        'En cours': 'Qualifiés',
        'Proposition envoyée': 'Propositions',
        'Visite prévue': 'Visites en cours',
        'Offre reçue': 'Offre en cours',
        'Dépôt reçu': 'Dépôt reçu',
        'En attente de signature': 'Signature finale',
        'Conclus': 'Conclus'
        // Ajouter d'autres mappings selon vos statuts réels
      };
      
      // Compter les leads par étape
      const stageCounts: Record<string, number> = {};
      stages.forEach(stage => { stageCounts[stage] = 0; }); // Initialiser toutes les étapes à 0
      
      leadsData?.forEach(lead => {
        const stage = statusToStage[lead.status] || 'Nouveaux'; // Par défaut, considérer comme "Nouveaux"
        stageCounts[stage] = (stageCounts[stage] || 0) + 1;
      });
      
      // Formater pour le graphique
      const formattedData = stages.map(name => ({
        name,
        total: stageCounts[name] || 0
      }));
      
      return formattedData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePortalLeadsData = (period: string) => {
  const periodMap: Record<string, string> = {
    'week': 'semaine',
    'month': 'mois',
    'quarter': 'trimestre',
    'year': 'annee',
    'custom': 'custom'
  };

  const mappedPeriod = periodMap[period] || 'mois';

  return useQuery({
    queryKey: ['portal-leads', mappedPeriod],
    queryFn: async () => {
      // Calculer la période en fonction du filtre sélectionné
      const now = new Date();
      let startDate = new Date();
      
      if (mappedPeriod === 'semaine') {
        startDate.setDate(now.getDate() - 7);
      } else if (mappedPeriod === 'mois') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (mappedPeriod === 'trimestre') {
        startDate.setMonth(now.getMonth() - 3);
      } else if (mappedPeriod === 'annee') {
        startDate.setFullYear(now.getFullYear() - 1);
      }
      
      // Récupérer les leads qui viennent de portails immobiliers
      const { data: portalLeads, error: portalError } = await supabase
        .from('leads')
        .select('source, url')
        .eq('integration_source', 'portail')
        .gte('created_at', startDate.toISOString());
        
      if (portalError) {
        console.error('Erreur lors du chargement des données de portails:', portalError);
        throw new Error(portalError.message);
      }
      
      // Si aucune donnée n'est retournée ou le jeu de données est trop petit,
      // utiliser des données de démo pour avoir une meilleure visualisation
      if (!portalLeads || portalLeads.length < 5) {
        // Données de démo pour un affichage plus complet
        return [
          { name: 'Se Loger Prestige', value: 28, count: 42 },
          { name: 'Propriétés Le Figaro', value: 22, count: 33 },
          { name: 'Belles Demeures', value: 18, count: 27 },
          { name: 'Green-Acres', value: 12, count: 18 },
          { name: 'LuxuryEstate', value: 8, count: 12 },
          { name: 'Barnes', value: 7, count: 10 },
          { name: 'Sotheby\'s', value: 5, count: 8 }
        ];
      }
      
      // Déterminer le portail à partir de l'URL ou de la source
      const portalData = (portalLeads || []).map(lead => {
        let portalName = 'Autre';
        
        if (lead.url) {
          if (lead.url.includes('seloger')) portalName = 'Se Loger Prestige';
          else if (lead.url.includes('figaro')) portalName = 'Propriétés Le Figaro';
          else if (lead.url.includes('bellesdemeures')) portalName = 'Belles Demeures';
          else if (lead.url.includes('green-acres')) portalName = 'Green-Acres';
          else if (lead.url.includes('luxuryestate')) portalName = 'LuxuryEstate';
          else if (lead.url.includes('barnes')) portalName = 'Barnes';
          else if (lead.url.includes('sothebys')) portalName = 'Sotheby\'s';
          else if (lead.url.includes('christie')) portalName = 'Christie\'s';
          else if (lead.url.includes('immobilier')) portalName = 'Immobilier.fr';
          else if (lead.url.includes('jamesedition')) portalName = 'JamesEdition';
        } else if (lead.source) {
          portalName = lead.source;
        }
        
        return portalName;
      });
      
      // Compter les occurrences de chaque portail
      const portalCount: Record<string, number> = {};
      portalData.forEach(portal => {
        portalCount[portal] = (portalCount[portal] || 0) + 1;
      });
      
      // Calculer les pourcentages et formater pour le graphique
      const total = Object.values(portalCount).reduce((a, b) => a + b, 0) || 1; // Éviter division par zéro
      
      const formattedData = Object.entries(portalCount).map(([name, count]) => {
        return {
          name,
          value: Math.round((count / total) * 100),
          count
        };
      });
      
      // Trier par valeur décroissante pour un meilleur affichage
      return formattedData.sort((a, b) => b.value - a.value);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLeadsAgentData = (period: 'semaine' | 'mois' | 'annee') => {
  return useQuery({
    queryKey: ['leads-agent-data', period],
    queryFn: async () => {
      // Calculer la période en fonction du filtre sélectionné
      const now = new Date();
      let startDate = new Date();
      
      if (period === 'semaine') {
        startDate.setDate(now.getDate() - 7);
      } else if (period === 'mois') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (period === 'annee') {
        startDate.setFullYear(now.getFullYear() - 1);
      }
      
      // Récupérer les team members (agents)
      const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select('id, name')
        .eq('role', 'commercial');
        
      if (teamError) {
        console.error('Erreur lors du chargement des agents:', teamError);
        throw new Error(teamError.message);
      }
      
      // Pour chaque agent, récupérer le nombre de leads pour chaque période
      const agentData = await Promise.all(
        (teamMembers || []).map(async (member) => {
          // Récupérer les leads de la période actuelle
          const { count: currentCount, error: currentError } = await supabase
            .from('leads')
            .select('id', { count: 'exact', head: true })
            .eq('assigned_to', member.id)
            .gte('created_at', startDate.toISOString());
            
          if (currentError) {
            console.error(`Erreur pour les leads de ${member.name}:`, currentError);
            throw new Error(currentError.message);
          }

          // Récupérer les leads de la période précédente pour calculer l'évolution
          let previousStartDate = new Date(startDate);
          let previousEndDate = new Date(startDate);
          
          if (period === 'semaine') {
            previousStartDate.setDate(previousStartDate.getDate() - 7);
          } else if (period === 'mois') {
            previousStartDate.setMonth(previousStartDate.getMonth() - 1);
          } else if (period === 'annee') {
            previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
          }
          
          const { count: previousCount, error: prevError } = await supabase
            .from('leads')
            .select('id', { count: 'exact', head: true })
            .eq('assigned_to', member.id)
            .gte('created_at', previousStartDate.toISOString())
            .lt('created_at', startDate.toISOString());
            
          if (prevError) {
            console.error(`Erreur pour les leads précédents de ${member.name}:`, prevError);
          }
          
          // Calculer l'évolution
          const previousCountValue = previousCount || 1; // éviter division par zéro
          const change = Math.round(((currentCount - previousCountValue) / previousCountValue) * 100);
          
          return {
            name: member.name,
            [period]: currentCount || 0,
            change: change
          };
        })
      );
      
      return agentData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fonctions utilitaires
function formatPerformanceData(data: any[], period: string) {
  // Formatter les données de performance en fonction de la période
  const formatOptions: Record<string, any> = {
    semaine: {
      format: (date: Date) => {
        const day = date.getDate();
        return `${day}/${date.getMonth() + 1}`;
      },
      groupBy: (date: Date) => date.getDate()
    },
    mois: {
      format: (date: Date) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[date.getMonth()];
      },
      groupBy: (date: Date) => date.getMonth()
    },
    trimestre: {
      format: (date: Date) => {
        return `Q${Math.floor(date.getMonth() / 3) + 1}`;
      },
      groupBy: (date: Date) => Math.floor(date.getMonth() / 3)
    },
    annee: {
      format: (date: Date) => date.getFullYear().toString(),
      groupBy: (date: Date) => date.getFullYear()
    }
  };
  
  const formatter = formatOptions[period] || formatOptions.mois;
  
  // Grouper les données par période
  const groupedData: Record<string, number> = {};
  
  data.forEach(item => {
    const date = new Date(item.created_at);
    const key = formatter.format(date);
    
    // Extraire la valeur numérique du budget
    let budgetValue = 0;
    if (item.budget) {
      budgetValue = extractNumericValue(item.budget);
    }
    
    groupedData[key] = (groupedData[key] || 0) + budgetValue;
  });
  
  // Convertir en format attendu par le graphique
  return Object.entries(groupedData).map(([name, total]) => ({
    name,
    total
  }));
}

function extractNumericValue(budgetString: string): number {
  if (!budgetString) return 0;
  
  // Convertir en chaîne si ce n'est pas déjà le cas
  const budget = String(budgetString);
  
  // Extraire les chiffres de la chaîne
  const match = budget.match(/(\d+[.,]?\d*)/);
  if (!match) return 0;
  
  // Convertir en nombre
  const value = parseFloat(match[0].replace(',', '.'));
  
  // Détecter les unités (M pour million, K pour millier)
  if (budget.includes('M') || budget.includes('m')) {
    return value * 1000000;
  } else if (budget.includes('K') || budget.includes('k')) {
    return value * 1000;
  }
  
  return value;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `€${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `€${(value / 1000).toFixed(0)}K`;
  } else {
    return `€${value.toFixed(0)}`;
  }
}
