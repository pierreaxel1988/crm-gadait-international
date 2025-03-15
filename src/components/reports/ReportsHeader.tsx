
import React from 'react';
import { CalendarRange, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReportsHeaderProps {
  period: string;
  setPeriod: (value: string) => void;
}

const ReportsHeader: React.FC<ReportsHeaderProps> = ({ period, setPeriod }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold">Rapports</h1>
        <p className="text-muted-foreground mt-1">Analysez les performances et visualisez les tendances</p>
      </div>
      
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <div className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4" />
              <SelectValue placeholder="Période" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Cette semaine</SelectItem>
            <SelectItem value="month">Ce mois</SelectItem>
            <SelectItem value="quarter">Ce trimestre</SelectItem>
            <SelectItem value="year">Cette année</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="outline" className="w-full sm:w-auto px-3 py-2 flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span>Exporter</span>
        </Button>
      </div>
    </div>
  );
};

export default ReportsHeader;
