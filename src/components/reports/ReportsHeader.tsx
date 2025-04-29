
import React from 'react';
import { CalendarRange, Download, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface ReportsHeaderProps {
  period: string;
  setPeriod: (value: string) => void;
  onExport?: () => void;
}

const ReportsHeader: React.FC<ReportsHeaderProps> = ({ period, setPeriod, onExport }) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-futura">Rapports</h1>
          <p className="text-muted-foreground font-futuraLight mt-1">Analysez les performances et visualisez les tendances efficacement</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background border-input">
              <div className="flex items-center gap-2">
                <CalendarRange className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Période" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
              <SelectItem value="custom">Personnalisé</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            className="w-full sm:w-auto flex items-center gap-2 bg-background"
            onClick={onExport}
          >
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </Button>
        </div>
      </div>
      
      <Separator className="my-4" />
    </div>
  );
};

export default ReportsHeader;
