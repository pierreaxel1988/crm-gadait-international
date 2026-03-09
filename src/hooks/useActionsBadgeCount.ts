import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { isPast, isToday } from 'date-fns';

export const useActionsBadgeCount = () => {
  const [overdueCount, setOverdueCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const { user, isCommercial } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    const fetchCounts = async () => {
      try {
        // Find current team member
        let query = supabase.from('leads').select('action_history, assigned_to, status');
        
        if (isCommercial) {
          const { data: tm } = await supabase
            .from('team_members')
            .select('id')
            .eq('email', user.email)
            .single();
          if (tm) query = query.eq('assigned_to', tm.id);
        }

        // Exclude closed leads
        query = query.not('status', 'in', '("Gagné","Perdu")');

        const { data: leads } = await query;
        
        let overdue = 0;
        let today = 0;

        leads?.forEach(lead => {
          if (!Array.isArray(lead.action_history)) return;
          lead.action_history.forEach((action: any) => {
            if (action.completedDate) return;
            if (!action.scheduledDate) return;
            const d = new Date(action.scheduledDate);
            if (isPast(d) && !isToday(d)) overdue++;
            else if (isToday(d)) today++;
          });
        });

        setOverdueCount(overdue);
        setTodayCount(today);
      } catch (e) {
        console.error('Error fetching action counts:', e);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 5 * 60 * 1000); // Refresh every 5 min
    return () => clearInterval(interval);
  }, [user, isCommercial]);

  return { overdueCount, todayCount, totalCount: overdueCount + todayCount };
};
