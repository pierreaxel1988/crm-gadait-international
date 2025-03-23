
import React, { useState, useEffect } from 'react';
import DashboardStats from '@/components/dashboard/DashboardStats';
import { getLeads } from '@/services/leadService';

const StatsSection = () => {
  const [stats, setStats] = useState({
    newLeads: 0,
    qualifiedLeads: 0,
    upcomingTasks: 0
  });
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const leads = await getLeads();
        
        // Updated to include both English and French statuses
        const newLeadsCount = leads.filter(lead => 
          lead.status === "New" && 
          new Date(lead.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length;
        
        const qualifiedLeadsCount = leads.filter(lead => 
          lead.status === "Qualified"
        ).length;
        
        const upcomingTasksCount = leads.filter(lead => 
          lead.nextFollowUpDate && 
          new Date(lead.nextFollowUpDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
        ).length;
        
        setStats({
          newLeads: newLeadsCount,
          qualifiedLeads: qualifiedLeadsCount,
          upcomingTasks: upcomingTasksCount
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Keep default stats in case of error
      }
    };
    
    fetchStats();
  }, []);

  return <DashboardStats stats={stats} />;
};

export default StatsSection;
