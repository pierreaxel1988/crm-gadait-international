
import React, { useState, useEffect } from 'react';
import DashboardStats from '@/components/dashboard/DashboardStats';
import { getLeads } from '@/services/leadService';

const StatsSection = () => {
  const [stats, setStats] = useState({
    newLeads: 0,
    qualifiedLeads: 0,
    upcomingTasks: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    try {
      // Add debug logging 
      console.log("StatsSection loading data");
      
      const leads = getLeads();
      console.log("Leads fetched:", leads.length);
      
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
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return loading ? (
    <div className="flex justify-center py-4">
      <div className="animate-spin h-8 w-8 border-4 border-chocolate-dark rounded-full border-t-transparent"></div>
    </div>
  ) : (
    <DashboardStats stats={stats} />
  );
};

export default StatsSection;
