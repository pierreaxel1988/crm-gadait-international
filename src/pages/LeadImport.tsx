
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import CustomButton from '@/components/ui/CustomButton';
import LeadApiGuide from '@/components/leads/LeadApiGuide';
import LeadImportForm from '@/components/leads/LeadImportForm';
import ImportedLeadsPanel from '@/components/leads/ImportedLeadsPanel';
import { useIsMobile } from '@/hooks/use-mobile';

const LeadImport = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('import');
  const isMobile = useIsMobile();

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header with back button - adjusted for mobile */}
      <div className="flex items-center gap-2">
        <CustomButton 
          variant="outline" 
          onClick={() => navigate('/leads')}
          className="w-auto p-1.5 md:p-2 rounded border-chocolate-light text-chocolate-dark hover:bg-chocolate-light/10"
        >
          <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
        </CustomButton>
        <div>
          <h1 className="text-xl md:text-3xl font-semibold text-loro-navy">Importation de Leads</h1>
          <p className="text-sm md:text-base text-loro-hazel">Importer des leads manuellement ou via l'API</p>
        </div>
      </div>

      {/* Tabs - improved for mobile */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`grid grid-cols-3 ${isMobile ? 'w-full' : 'max-w-md'}`}>
          <TabsTrigger value="import" className="text-xs md:text-sm">Importer</TabsTrigger>
          <TabsTrigger value="api" className="text-xs md:text-sm">API</TabsTrigger>
          <TabsTrigger value="recents" className="text-xs md:text-sm">Récents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="import" className="space-y-4">
          <LeadImportForm />
        </TabsContent>
        
        <TabsContent value="api" className="space-y-4">
          <LeadApiGuide />
        </TabsContent>
        
        <TabsContent value="recents" className="space-y-4">
          <ImportedLeadsPanel limit={10} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadImport;
