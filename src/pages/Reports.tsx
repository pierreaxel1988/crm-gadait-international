
import React, { useState } from 'react';
import { FileChartLine, Users, Calendar, Filter, ChevronDown, PieChart } from 'lucide-react';
import { BarChart } from '@/components/ui/bar-chart';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LeadStatusPieChart from '@/components/reports/LeadStatusPieChart';
import PropertyViewsChart from '@/components/reports/PropertyViewsChart';
import LeadSourcesTable from '@/components/reports/LeadSourcesTable';
import DateRangeFilter from '@/components/reports/DateRangeFilter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ReportsContent = () => {
  const [dateRange, setDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });

  const monthlyRevenue = [
    { name: 'Jan', total: 2200 },
    { name: 'Fév', total: 3400 },
    { name: 'Mar', total: 4500 },
    { name: 'Avr', total: 5200 },
    { name: 'Mai', total: 3800 },
    { name: 'Jun', total: 6000 },
    { name: 'Jul', total: 7800 },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Rapports</h1>
          <p className="text-muted-foreground">Analysez vos performances commerciales</p>
        </div>
        <DateRangeFilter 
          dateRange={dateRange} 
          setDateRange={setDateRange} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Leads par statut"
          subtitle="Répartition actuelle"
          icon={<Users className="h-5 w-5" />}
          className="col-span-1"
        >
          <div className="h-64">
            <LeadStatusPieChart />
          </div>
        </DashboardCard>

        <DashboardCard
          title="Propriétés les plus consultées"
          subtitle="Top 5 propriétés"
          icon={<FileChartLine className="h-5 w-5" />}
          className="col-span-1 md:col-span-2"
        >
          <div className="h-64">
            <PropertyViewsChart />
          </div>
        </DashboardCard>
      </div>

      <DashboardCard
        title="Revenus mensuels estimés"
        subtitle="Basé sur les offres acceptées"
        icon={<PieChart className="h-5 w-5" />}
        className="w-full"
      >
        <div className="h-64">
          <BarChart data={monthlyRevenue} />
        </div>
      </DashboardCard>

      <DashboardCard
        title="Sources de leads"
        subtitle="Répartition par origine"
        icon={<FileChartLine className="h-5 w-5" />}
        className="w-full"
      >
        <LeadSourcesTable />
      </DashboardCard>
    </div>
  );
};

// Wrap everything in QueryClientProvider
const Reports = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ReportsContent />
    </QueryClientProvider>
  );
};

export default Reports;
