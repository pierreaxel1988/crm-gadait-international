
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ActionHistoryItem } from '@/types/actionHistory';

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
          // Type assertion to help TypeScript understand our array type
          const actionHistory = lead.action_history as ActionHistoryItem[];
          
          // Find first contact action (call, email, message, etc.)
          const contactActions = actionHistory.filter((action) => 
            ['call', 'email', 'message', 'contact'].some(term => 
              action.actionType?.toLowerCase().includes(term)
            )
          );

          if (contactActions.length > 0) {
            // Sort by date to find the earliest contact
            contactActions.sort((a, b) => {
              // Extract date information safely, handling different data formats
              let aDate: Date | null = null;
              let bDate: Date | null = null;
              
              // Try different date fields for first action
              if (a.date) {
                aDate = new Date(a.date);
              } else if (a.timestamp) {
                aDate = new Date(a.timestamp);
              } else if (a.created) {
                aDate = new Date(a.created);
              } else if (a.createdDate) {
                aDate = new Date(a.createdDate);
              } else if (a.createdAt) {
                aDate = new Date(a.createdAt);
              }
              
              // Try different date fields for second action
              if (b.date) {
                bDate = new Date(b.date);
              } else if (b.timestamp) {
                bDate = new Date(b.timestamp);
              } else if (b.created) {
                bDate = new Date(b.created);
              } else if (b.createdDate) {
                bDate = new Date(b.createdDate);
              } else if (b.createdAt) {
                bDate = new Date(b.createdAt);
              }
              
              if (!aDate || !bDate) return 0;
              return aDate.getTime() - bDate.getTime();
            });

            const firstContact = contactActions[0];
            if (firstContact) {
              let contactedAt: Date | null = null;
              
              // Try to extract date from various possible fields
              if (firstContact.date) {
                contactedAt = new Date(firstContact.date);
              } else if (firstContact.timestamp) {
                contactedAt = new Date(firstContact.timestamp);
              } else if (firstContact.created) {
                contactedAt = new Date(firstContact.created);
              } else if (firstContact.createdDate) {
                contactedAt = new Date(firstContact.createdDate);
              } else if (firstContact.createdAt) {
                contactedAt = new Date(firstContact.createdAt);
              }
              
              if (contactedAt) {
                const createdAt = new Date(lead.created_at);
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
          leadsCount: data.count,
          name: undefined // This will be populated by the component that uses this data
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
