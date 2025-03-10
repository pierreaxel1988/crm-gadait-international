import React from 'react';
import { BarChart3, CalendarDays, Phone, Plus, Users } from 'lucide-react';
import LeadStatCard from '@/components/dashboard/LeadStatCard';
import DashboardCard from '@/components/dashboard/DashboardCard';
import RecentActivityCard from '@/components/dashboard/RecentActivityCard';
import CustomButton from '@/components/ui/CustomButton';
import { BarChart } from '@/components/ui/bar-chart';

const mockActivities = [{
  id: '1',
  user: {
    name: 'Sophie Martin'
  },
  action: 'qualified a lead',
  target: 'Jean Dupont',
  timestamp: '10 minutes ago'
}, {
  id: '2',
  user: {
    name: 'Thomas Bernard'
  },
  action: 'added a new lead',
  target: 'Marie Lambert',
  timestamp: '1 hour ago'
}, {
  id: '3',
  user: {
    name: 'Julie Dubois'
  },
  action: 'scheduled a visit with',
  target: 'Pierre Moreau',
  timestamp: '3 hours ago'
}, {
  id: '4',
  user: {
    name: 'Lucas Petit'
  },
  action: 'received a deposit from',
  target: 'Claire Simon',
  timestamp: 'Yesterday at 14:30'
}];

const chartData = [{
  name: 'Jan',
  total: 1200
}, {
  name: 'Feb',
  total: 1900
}, {
  name: 'Mar',
  total: 2100
}, {
  name: 'Apr',
  total: 1800
}, {
  name: 'May',
  total: 2800
}, {
  name: 'Jun',
  total: 2300
}, {
  name: 'Jul',
  total: 3500
}];

const Index = () => {
  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-[1920px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, here's what's happening today.</p>
        </div>
        <CustomButton className="text-white flex items-center gap-1.5 w-full sm:w-auto bg-gray-900 hover:bg-gray-800">
          <Plus className="h-4 w-4" /> New Lead
        </CustomButton>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
        <LeadStatCard title="Total Leads" value="1,547" change={12} icon={<Users className="h-5 w-5" />} />
        <LeadStatCard title="Qualified Leads" value="835" change={8} icon={<Users className="h-5 w-5" />} />
        <LeadStatCard title="Visits This Month" value="32" change={-4} icon={<CalendarDays className="h-5 w-5" />} />
        <LeadStatCard title="Calls This Week" value="128" change={16} icon={<Phone className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <DashboardCard 
          title="Lead Acquisition" 
          subtitle="Last 7 months" 
          icon={<BarChart3 className="h-5 w-5" />} 
          className="lg:col-span-2 h-[500px] lg:h-[600px]"
        >
          <div className="h-full w-full">
            <BarChart data={chartData} />
          </div>
        </DashboardCard>

        <RecentActivityCard activities={mockActivities} className="h-[450px] lg:h-[550px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        <DashboardCard title="Top Performing Agents" className="h-full">
          <div className="space-y-6 lg:space-y-8 p-3 pt-5">
            {['Sophie Martin', 'Thomas Bernard', 'Julie Dubois', 'Lucas Petit'].map((agent, index) => (
              <div key={agent} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
                <div className="flex items-center">
                  <div className="h-12 w-12 lg:h-14 lg:w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg">
                    {agent.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-base lg:text-lg">{agent}</p>
                    <p className="text-sm lg:text-base text-muted-foreground">
                      {['28', '21', '18', '15'][index]} leads this month
                    </p>
                  </div>
                </div>
                <div>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    index === 0 ? 'bg-luxury-200 text-luxury-800' : 
                    index === 1 ? 'bg-luxury-100 text-luxury-700' : 
                    'bg-luxury-50 text-luxury-600'
                  }`}>
                    #{index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Recent Conversions" className="h-full">
          <div className="space-y-6 lg:space-y-8 p-3 pt-5">
            {['Villa Saint-Tropez', 'Penthouse Paris 8e', 'Chalet Megève', 'Appartement Cannes Croisette'].map((property, index) => (
              <div key={property} className="flex items-center p-3 hover:bg-muted/50 rounded-lg transition-colors">
                <div className="h-12 w-12 lg:h-14 lg:w-14 rounded bg-luxury-100 flex items-center justify-center text-luxury-800 text-lg font-medium">
                  #{index + 1}
                </div>
                <div className="ml-4">
                  <p className="font-medium text-base lg:text-lg">{property}</p>
                  <p className="text-sm lg:text-base text-muted-foreground">
                    {['€4.2M', '€3.8M', '€2.7M', '€1.9M'][index]} • {['Yesterday', '2 days ago', '3 days ago', '4 days ago'][index]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default Index;
