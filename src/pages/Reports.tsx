
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ChartPie, ChartBar, BarChart3, LineChart } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ReportsHeader from '@/components/reports/ReportsHeader';
import PerformanceTabContent from '@/components/reports/PerformanceTabContent';
import LeadsTabContent from '@/components/reports/LeadsTabContent';
import ConversionTabContent from '@/components/reports/ConversionTabContent';
import { useToast } from "@/components/ui/use-toast";

const Reports = () => {
  const [period, setPeriod] = useState<string>('month');
  const { toast } = useToast();
  
  const handleExport = () => {
    toast({
      title: "Export initié",
      description: "Votre rapport sera téléchargé dans quelques instants",
      duration: 3000
    });
  };
  
  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1920px] mx-auto">
      <ReportsHeader period={period} setPeriod={setPeriod} onExport={handleExport} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Leads totaux</p>
                <h3 className="text-3xl font-bold mt-1 text-blue-900">527</h3>
                <p className="text-sm text-blue-700 mt-1">+12% depuis le dernier mois</p>
              </div>
              <div className="bg-blue-200 p-2 rounded-full">
                <ChartBar className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-800">Taux de conversion</p>
                <h3 className="text-3xl font-bold mt-1 text-emerald-900">28%</h3>
                <p className="text-sm text-emerald-700 mt-1">+5% depuis le dernier mois</p>
              </div>
              <div className="bg-emerald-200 p-2 rounded-full">
                <ChartPie className="h-6 w-6 text-emerald-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-amber-800">Valeur moyenne</p>
                <h3 className="text-3xl font-bold mt-1 text-amber-900">€1.2M</h3>
                <p className="text-sm text-amber-700 mt-1">+8% depuis le dernier mois</p>
              </div>
              <div className="bg-amber-200 p-2 rounded-full">
                <LineChart className="h-6 w-6 text-amber-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="mb-6 grid grid-cols-3 md:flex md:flex-wrap w-full md:w-auto bg-secondary/20">
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Performance</span>
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <ChartBar className="h-4 w-4" />
            <span>Leads</span>
          </TabsTrigger>
          <TabsTrigger value="conversion" className="flex items-center gap-2">
            <ChartPie className="h-4 w-4" />
            <span>Conversion</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance">
          <PerformanceTabContent />
        </TabsContent>
        
        <TabsContent value="leads">
          <LeadsTabContent />
        </TabsContent>
        
        <TabsContent value="conversion">
          <ConversionTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
