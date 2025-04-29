
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useLuxuryMetrics = (period: string) => {
  // Financial metrics
  const { data: financialMetrics, isLoading: isLoadingFinancial } = useQuery({
    queryKey: ['financial-metrics', period],
    queryFn: async () => {
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
      
      // Fetch concluded leads with budget for average commission
      const { data: currentLeads } = await supabase
        .from('leads')
        .select('budget')
        .eq('status', 'Conclus')
        .gte('created_at', startDate.toISOString());
      
      const { data: previousLeads } = await supabase
        .from('leads')
        .select('budget')
        .eq('status', 'Conclus')
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString());
      
      // Calculate average commission (assuming 5% of property price)
      const calculateAvgCommission = (leads: any[]) => {
        if (!leads || leads.length === 0) return 0;
        
        const totalCommission = leads.reduce((sum, lead) => {
          const budget = extractNumericValue(lead.budget);
          return sum + (budget * 0.05); // 5% commission
        }, 0);
        
        return totalCommission / leads.length;
      };
      
      const currentAvgCommission = calculateAvgCommission(currentLeads || []);
      const previousAvgCommission = calculateAvgCommission(previousLeads || []);
      const commissionChange = previousAvgCommission ? 
        Math.round(((currentAvgCommission - previousAvgCommission) / previousAvgCommission) * 100) : 0;
      
      // Profitability by property type
      const { data: propertyTypes } = await supabase
        .from('leads')
        .select('property_type, budget')
        .eq('status', 'Conclus')
        .gte('created_at', startDate.toISOString());
      
      const profitByType = calculateProfitByType(propertyTypes || []);
      
      return {
        avgCommission: formatCurrency(currentAvgCommission),
        commissionChange,
        profitByPropertyType: profitByType,
        pricePerSqm: '€15,250',
        pricePerSqmChange: 8,
        // Sample data for demonstration
        luxuryIndex: 142,
        luxuryIndexChange: 12
      };
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  
  // Geographic analysis
  const { data: geoData, isLoading: isLoadingGeo } = useQuery({
    queryKey: ['geo-data', period],
    queryFn: async () => {
      // Sample data for demonstration
      return [
        { name: 'Paris 16', value: 35, color: '#8884d8' },
        { name: 'Paris 8', value: 25, color: '#83a6ed' },
        { name: 'Neuilly', value: 15, color: '#8dd1e1' },
        { name: 'Cannes', value: 10, color: '#82ca9d' },
        { name: 'Saint-Tropez', value: 8, color: '#a4de6c' },
        { name: 'Autres', value: 7, color: '#d0ed57' }
      ];
    },
    staleTime: 5 * 60 * 1000
  });
  
  // Agent performance data
  const { data: agentPerformance, isLoading: isLoadingAgentPerf } = useQuery({
    queryKey: ['agent-luxury-performance', period],
    queryFn: async () => {
      const { data: agents } = await supabase
        .from('team_members')
        .select('id, name')
        .eq('role', 'commercial');
      
      if (!agents) return [];
      
      // For this demo, we'll augment the real agent data with sample metrics
      // In a real implementation, these would come from the database
      return agents.map((agent, index) => {
        return {
          name: agent.name,
          leads: 15 + Math.floor(Math.random() * 30),
          sales: 3 + Math.floor(Math.random() * 8),
          mandates: 4 + Math.floor(Math.random() * 10),
          satisfaction: 85 + Math.floor(Math.random() * 15),
          change: -10 + Math.floor(Math.random() * 25)
        };
      });
    },
    staleTime: 5 * 60 * 1000
  });
  
  // Lead source analysis with ROI
  const { data: leadSourceAnalysis, isLoading: isLoadingLeadSource } = useQuery({
    queryKey: ['lead-source-analysis', period],
    queryFn: async () => {
      const { data: leadSources } = await supabase
        .from('leads')
        .select('source')
        .not('source', 'is', null);
      
      const sourceCount: Record<string, number> = {};
      leadSources?.forEach(lead => {
        const source = lead.source || 'Inconnu';
        sourceCount[source] = (sourceCount[source] || 0) + 1;
      });
      
      // Generate sample data for cost, conversion and ROI
      return Object.entries(sourceCount).map(([name, count]) => {
        const cost = 50 + Math.floor(Math.random() * 200); // Cost per lead
        const conversion = 5 + Math.floor(Math.random() * 25); // Conversion rate
        // ROI calculation: (Revenue - Cost) / Cost * 100
        // Assuming average deal value of €15,000 (commission on luxury property)
        const revenue = count * (conversion / 100) * 15000;
        const totalCost = count * cost;
        const roi = totalCost > 0 ? Math.floor((revenue - totalCost) / totalCost * 100) : 0;
        
        return {
          name,
          count,
          cost,
          conversion,
          roi
        };
      });
    },
    staleTime: 5 * 60 * 1000
  });
  
  // Predictive analysis for sales
  const { data: salesPrediction, isLoading: isLoadingSalesPrediction } = useQuery({
    queryKey: ['sales-prediction', period],
    queryFn: async () => {
      // For demonstration, we'll generate some sample data
      // In a real application, this would come from a predictive model
      
      // Generate past data (actual)
      const pastData: any[] = [];
      for (let i = 6; i >= 0; i--) {
        const month = new Date();
        month.setMonth(month.getMonth() - i);
        const monthName = month.toLocaleString('default', { month: 'short' });
        
        pastData.push({
          name: monthName,
          actual: 3 + Math.floor(Math.random() * 8),
          predicted: 3 + Math.floor(Math.random() * 8)
        });
      }
      
      // Generate future predictions
      const futureData: any[] = [];
      for (let i = 1; i <= 4; i++) {
        const month = new Date();
        month.setMonth(month.getMonth() + i);
        const monthName = month.toLocaleString('default', { month: 'short' });
        
        const predictedValue = 5 + Math.floor(Math.random() * 7);
        futureData.push({
          name: monthName,
          predicted: predictedValue,
          lowerBound: Math.max(0, predictedValue - 2),
          upperBound: predictedValue + 2
        });
      }
      
      return [...pastData, ...futureData];
    },
    staleTime: 5 * 60 * 1000
  });
  
  // Predictive analysis for average price
  const { data: pricePrediction, isLoading: isLoadingPricePrediction } = useQuery({
    queryKey: ['price-prediction', period],
    queryFn: async () => {
      // For demonstration, we'll generate some sample data
      // In a real application, this would come from a predictive model
      
      // Generate past data (actual)
      const pastData: any[] = [];
      let basePrice = 2200000;
      
      for (let i = 6; i >= 0; i--) {
        const month = new Date();
        month.setMonth(month.getMonth() - i);
        const monthName = month.toLocaleString('default', { month: 'short' });
        
        const actualValue = Math.round(basePrice / 100000) * 100000;
        
        pastData.push({
          name: monthName,
          actual: actualValue / 1000000, // Convert to millions for display
          predicted: actualValue / 1000000
        });
        
        basePrice += Math.random() > 0.5 ? 50000 : -20000; // Price fluctuation
      }
      
      // Generate future predictions
      const futureData: any[] = [];
      for (let i = 1; i <= 4; i++) {
        const month = new Date();
        month.setMonth(month.getMonth() + i);
        const monthName = month.toLocaleString('default', { month: 'short' });
        
        const predictedValue = Math.round(basePrice / 100000) * 100000 / 1000000;
        futureData.push({
          name: monthName,
          predicted: predictedValue,
          lowerBound: Math.max(0, predictedValue - 0.2),
          upperBound: predictedValue + 0.2
        });
        
        basePrice += 30000 + Math.floor(Math.random() * 40000); // Predicted growth
      }
      
      return [...pastData, ...futureData];
    },
    staleTime: 5 * 60 * 1000
  });
  
  return {
    financialMetrics,
    isLoadingFinancial,
    geoData,
    isLoadingGeo,
    agentPerformance,
    isLoadingAgentPerf,
    leadSourceAnalysis,
    isLoadingLeadSource,
    salesPrediction,
    isLoadingSalesPrediction,
    pricePrediction,
    isLoadingPricePrediction
  };
};

// Helper functions
function extractNumericValue(value: any): number {
  if (!value) return 0;
  
  // If it's already a number
  if (typeof value === 'number') return value;
  
  const strValue = String(value);
  
  // Try to extract numeric value from string like "€1.5M" or "2,500,000€"
  const numericMatch = strValue.match(/(\d+[.,]?\d*)/g);
  if (!numericMatch) return 0;
  
  let extractedValue = parseFloat(numericMatch.join('').replace(',', '.'));
  
  // Check for million/thousand indicators
  if (strValue.toLowerCase().includes('m')) {
    extractedValue *= 1000000;
  } else if (strValue.toLowerCase().includes('k')) {
    extractedValue *= 1000;
  }
  
  return extractedValue;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `€${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `€${(value / 1000).toFixed(0)}K`;
  } else {
    return `€${value.toFixed(0)}`;
  }
}

function calculateProfitByType(properties: any[]): {type: string, profit: number}[] {
  const profitByType: Record<string, {total: number, count: number}> = {};
  
  properties.forEach(property => {
    const type = property.property_type || 'Inconnu';
    const budget = extractNumericValue(property.budget);
    const profit = budget * 0.05; // 5% commission
    
    if (!profitByType[type]) {
      profitByType[type] = { total: 0, count: 0 };
    }
    
    profitByType[type].total += profit;
    profitByType[type].count++;
  });
  
  return Object.entries(profitByType).map(([type, data]) => ({
    type,
    profit: data.total / data.count // Average profit per property type
  }));
}
