
import React, { useState } from 'react';
import { ArrowDownUp } from 'lucide-react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import ConversionRateCard from '@/components/reports/ConversionRateCard';
import SalesPerformanceChart from '@/components/reports/SalesPerformanceChart';
import LeadSourceDistribution from '@/components/reports/LeadSourceDistribution';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLeadsSourceData } from '@/hooks/useReportsData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ConversionTabContentProps {
  conversionData: { name: string; total: number }[];
  isLoading: boolean;
  period: string;
}

const ConversionTabContent: React.FC<ConversionTabContentProps> = ({
  conversionData,
  isLoading,
  period
}) => {
  const isMobile = useIsMobile();
  
  // Récupérer les données des sources de leads pour la distribution
  const { data: leadsSourceData, isLoading: isLoadingLeadSources } = useLeadsSourceData(period);
  
  // Fetch conversion metrics
  const { data: conversionMetrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['conversion-metrics', period],
    queryFn: async () => {
      // Define the time period
      const now = new Date();
      let startDate = new Date();
      let previousStartDate = new Date();
      
      if (period === 'week') {
        startDate.setDate(now.getDate() - 7);
        previousStartDate.setDate(now.getDate() - 14);
      } else if (period === 'month') {
        startDate.setMonth(now.getMonth() - 1);
        previousStartDate.setMonth(now.getMonth() - 2);
      } else if (period === 'quarter') {
        startDate.setMonth(now.getMonth() - 3);
        previousStartDate.setMonth(now.getMonth() - 6);
      } else if (period === 'year') {
        startDate.setFullYear(now.getFullYear() - 1);
        previousStartDate.setFullYear(now.getFullYear() - 2);
      }
      
      // Total leads in the current period
      const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());
      
      // Leads that reached the "Visite prévue" status or beyond (visit rate)
      const { count: visitLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString())
        .or('status.eq.Visite prévue,status.eq.Offre reçue,status.eq.Dépôt reçu,status.eq.En attente de signature,status.eq.Conclus');
      
      // Previous period visit rate for comparison
      const { count: previousTotalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString());
      
      const { count: previousVisitLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString())
        .or('status.eq.Visite prévue,status.eq.Offre reçue,status.eq.Dépôt reçu,status.eq.En attente de signature,status.eq.Conclus');
      
      // Leads that reached the "Offre reçue" status or beyond (offer rate)
      const { count: offerLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString())
        .or('status.eq.Offre reçue,status.eq.Dépôt reçu,status.eq.En attente de signature,status.eq.Conclus');
      
      // Previous period offer rate for comparison
      const { count: previousOfferLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString())
        .or('status.eq.Offre reçue,status.eq.Dépôt reçu,status.eq.En attente de signature,status.eq.Conclus');
      
      // Leads that reached the "Conclus" status (signature rate)
      const { count: signatureLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString())
        .eq('status', 'Conclus');
      
      // Previous period signature rate for comparison
      const { count: previousSignatureLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString())
        .eq('status', 'Conclus');
      
      // Calculate rates and changes
      const visitRate = totalLeads ? Math.round((visitLeads / totalLeads) * 100) : 0;
      const previousVisitRate = previousTotalLeads ? Math.round((previousVisitLeads / previousTotalLeads) * 100) : 0;
      const visitChange = previousVisitRate ? visitRate - previousVisitRate : 0;
      
      const offerRate = totalLeads ? Math.round((offerLeads / totalLeads) * 100) : 0;
      const previousOfferRate = previousTotalLeads ? Math.round((previousOfferLeads / previousTotalLeads) * 100) : 0;
      const offerChange = previousOfferRate ? offerRate - previousOfferRate : 0;
      
      const signatureRate = visitLeads ? Math.round((signatureLeads / visitLeads) * 100) : 0;
      const previousSignatureRate = previousVisitLeads ? Math.round((previousSignatureLeads / previousVisitLeads) * 100) : 0;
      const signatureChange = previousSignatureRate ? signatureRate - previousSignatureRate : 0;
      
      return {
        visitRate,
        visitChange,
        offerRate,
        offerChange,
        signatureRate,
        signatureChange
      };
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  
  // Fetch property type distribution data
  const { data: propertyTypeData, isLoading: isLoadingPropertyTypes } = useQuery({
    queryKey: ['property-types', period],
    queryFn: async () => {
      // Define the time period
      const now = new Date();
      let startDate = new Date();
      
      if (period === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (period === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (period === 'quarter') {
        startDate.setMonth(now.getMonth() - 3);
      } else if (period === 'year') {
        startDate.setFullYear(now.getFullYear() - 1);
      }
      
      // Fetch leads with property types within the time period
      const { data: leads } = await supabase
        .from('leads')
        .select('property_type, property_types')
        .gte('created_at', startDate.toISOString());
      
      if (!leads || leads.length === 0) {
        return [];
      }
      
      // Count the occurrences of each property type
      const propertyTypeCounts: Record<string, number> = {};
      
      leads.forEach(lead => {
        // First check property_type field
        if (lead.property_type) {
          propertyTypeCounts[lead.property_type] = (propertyTypeCounts[lead.property_type] || 0) + 1;
        }
        // Then check property_types array
        else if (lead.property_types && Array.isArray(lead.property_types)) {
          lead.property_types.forEach((type: string) => {
            propertyTypeCounts[type] = (propertyTypeCounts[type] || 0) + 1;
          });
        }
      });
      
      // Convert to array format for the chart
      const total = Object.values(propertyTypeCounts).reduce((sum, count) => sum + count, 0);
      return Object.entries(propertyTypeCounts).map(([name, count]) => ({
        name,
        value: Math.round((count / total) * 100),
        count
      }));
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ConversionRateCard 
          title="Taux de visite" 
          value={`${conversionMetrics?.visitRate || 0}%`}
          change={conversionMetrics?.visitChange || 0} 
          period="vs dernier mois"
          isLoading={isLoadingMetrics}
        />
        <ConversionRateCard 
          title="Taux d'offre" 
          value={`${conversionMetrics?.offerRate || 0}%`}
          change={conversionMetrics?.offerChange || 0} 
          period="vs dernier mois"
          isLoading={isLoadingMetrics}
        />
        <ConversionRateCard 
          title="Taux de signature" 
          value={`${conversionMetrics?.signatureRate || 0}%`}
          change={conversionMetrics?.signatureChange || 0} 
          period="vs dernier mois"
          isLoading={isLoadingMetrics}
        />
      </div>
      
      <DashboardCard 
        title="Parcours de conversion" 
        subtitle="Évolution du statut des leads dans le pipeline" 
        icon={<ArrowDownUp className="h-5 w-5" />}
        className={isMobile ? "h-[750px]" : "h-[500px]"}
        isLoading={isLoading}
      >
        <div className={`h-full w-full ${isMobile ? "pt-2" : "pt-6"}`}>
          <SalesPerformanceChart 
            data={conversionData} 
            isConversionFunnel={true} 
          />
        </div>
      </DashboardCard>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard 
          title="Distribution des sources de leads" 
          subtitle="Répartition par canal d'acquisition" 
          icon={<ArrowDownUp className="h-5 w-5" />}
          className="h-[400px]"
          isLoading={isLoadingLeadSources}
        >
          <div className="h-full w-full pt-4">
            <LeadSourceDistribution isLeadSources={true} data={leadsSourceData || []} />
          </div>
        </DashboardCard>
        
        <DashboardCard 
          title="Distribution des types de biens" 
          subtitle="Répartition par type de propriété recherchée" 
          icon={<ArrowDownUp className="h-5 w-5" />}
          className="h-[400px]"
          isLoading={isLoadingPropertyTypes}
        >
          <div className="h-full w-full pt-4">
            <LeadSourceDistribution data={propertyTypeData || []} />
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default ConversionTabContent;
