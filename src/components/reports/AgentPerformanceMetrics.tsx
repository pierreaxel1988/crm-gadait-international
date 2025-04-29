
import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from 'lucide-react';

interface AgentData {
  name: string;
  leads: number;
  sales: number;
  mandates: number;
  satisfaction: number;
  change: number;
}

interface AgentPerformanceMetricsProps {
  data: AgentData[];
  isLoading: boolean;
}

const AgentPerformanceMetrics = ({ data, isLoading }: AgentPerformanceMetricsProps) => {
  const [metric, setMetric] = useState<'sales' | 'leads' | 'mandates' | 'satisfaction'>('sales');
  
  if (isLoading) {
    return <div className="w-full h-[400px] flex items-center justify-center">
      <Skeleton className="w-full h-[350px]" />
    </div>;
  }
  
  const colors = [
    "#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c",
    "#d0ed57", "#ffc658", "#ff8042", "#0088FE", "#00C49F"
  ];
  
  const getMetricLabel = () => {
    switch(metric) {
      case 'sales': return 'Ventes';
      case 'leads': return 'Leads';
      case 'mandates': return 'Mandats exclusifs';
      case 'satisfaction': return 'Satisfaction client (%)';
      default: return '';
    }
  };
  
  return (
    <Card className="w-full h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 border-b bg-gradient-to-r from-gray-50 to-gray-100">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-500" />
          <span>Performance des agents</span>
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Select value={metric} onValueChange={(v) => setMetric(v as any)}>
            <SelectTrigger className="w-[180px] border-gray-200 focus:ring-blue-200">
              <SelectValue placeholder="Choisir une métrique" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">Ventes</SelectItem>
              <SelectItem value="leads">Leads</SelectItem>
              <SelectItem value="mandates">Mandats exclusifs</SelectItem>
              <SelectItem value="satisfaction">Satisfaction client</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                border: "1px solid #f1f1f1"
              }}
            />
            <Legend />
            <Bar dataKey={metric} fill="#8884d8" name={getMetricLabel()}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AgentPerformanceMetrics;
