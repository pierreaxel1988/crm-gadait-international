
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useLeadResponseTime = (period: string) => {
  const periodMap: Record<string, string> = {
    'week': 'semaine',
    'month': 'mois',
    'quarter': 'trimestre',
    'year': 'annee',
    'custom': 'custom'
  };

  const mappedPeriod = periodMap[period] || 'mois';

  return useQuery({
    queryKey: ['lead-response-time', mappedPeriod],
    queryFn: async () => {
      // Calculate date range based on selected period
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
      
      // Fetch leads where we can calculate response time
      // We need leads with created_at and action_history
      const { data: leads, error } = await supabase
        .from('leads')
        .select('id, created_at, action_history, assigned_to')
        .gte('created_at', startDate.toISOString())
        .not('action_history', 'is', null);
        
      if (error) {
        console.error('Error fetching lead response time data:', error);
        throw error;
      }

      // Analyze response time by calculating the difference between
      // lead creation and first contact action
      let totalResponseTime = 0;
      let countedLeads = 0;
      
      // Track response time by agent
      const agentResponseTimes: Record<string, { totalMinutes: number, count: number }> = {};

      leads?.forEach(lead => {
        if (lead.action_history && Array.isArray(lead.action_history)) {
          // Find first contact action (call, email, message, etc.)
          const contactActions = lead.action_history.filter((action: any) => 
            ['call', 'email', 'message', 'contact'].some(term => 
              action.actionType?.toLowerCase().includes(term)
            )
          );

          if (contactActions.length > 0) {
            // Sort by createdAt date to find the earliest contact
            contactActions.sort((a: any, b: any) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );

            const firstContact = contactActions[0];
            if (firstContact.createdAt) {
              // Calculate difference in minutes
              const createdAt = new Date(lead.created_at);
              const contactedAt = new Date(firstContact.createdAt);
              const diffMinutes = (contactedAt.getTime() - createdAt.getTime()) / (1000 * 60);
              
              // Only count if response was within 7 days (10080 minutes)
              // This prevents outliers from skewing the average
              if (diffMinutes > 0 && diffMinutes < 10080) {
                totalResponseTime += diffMinutes;
                countedLeads++;
                
                // Track by agent if assigned
                if (lead.assigned_to) {
                  if (!agentResponseTimes[lead.assigned_to]) {
                    agentResponseTimes[lead.assigned_to] = { totalMinutes: 0, count: 0 };
                  }
                  
                  agentResponseTimes[lead.assigned_to].totalMinutes += diffMinutes;
                  agentResponseTimes[lead.assigned_to].count++;
                }
              }
            }
          }
        }
      });

      // Calculate overall average response time
      const avgResponseTime = countedLeads > 0 ? totalResponseTime / countedLeads : 0;
      
      // Prepare agent data
      const agentResponseData = Object.entries(agentResponseTimes).map(([agentId, data]) => {
        const avgMinutes = data.count > 0 ? data.totalMinutes / data.count : 0;
        return {
          agentId,
          avgResponseTime: avgMinutes, 
          leadsCount: data.count
        };
      }).sort((a, b) => a.avgResponseTime - b.avgResponseTime);

      return {
        averageResponseMinutes: avgResponseTime,
        countedLeads,
        byAgent: agentResponseData,
        raw: leads || []
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Helper function to format minutes into human-readable time
export const formatResponseTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)}min`;
  } else if (minutes < 1440) { // Less than 24 hours
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}min`;
  } else { // Days
    const days = Math.floor(minutes / 1440);
    const hours = Math.round((minutes % 1440) / 60);
    return `${days}j ${hours}h`;
  }
};
