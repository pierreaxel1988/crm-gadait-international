
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import CustomButton from '@/components/ui/CustomButton';
import LeadApiGuide from '@/components/leads/LeadApiGuide';
import LeadImportForm from '@/components/leads/LeadImportForm';
import ImportedLeadsPanel from '@/components/leads/ImportedLeadsPanel';

const LeadImport = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('import');

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-2">
        <CustomButton 
          variant="outline" 
          onClick={() => navigate('/leads')}
          className="w-auto p-2 rounded border-chocolate-light text-chocolate-dark hover:bg-chocolate-light/10"
        >
          <ArrowLeft className="h-4 w-4" />
        </CustomButton>
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-loro-navy">Importation de Leads</h1>
          <p className="text-loro-hazel">Importer des leads manuellement ou via l'API</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="import">Importer</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="recents">Récents</TabsTrigger>
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
