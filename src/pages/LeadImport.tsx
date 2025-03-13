
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        <CustomButton 
          variant="outline" 
          onClick={() => navigate('/leads')}
          className="w-auto p-2 rounded-full border-chocolate-light text-chocolate-dark hover:bg-chocolate-light/10"
        >
          <ArrowLeft className="h-4 w-4" />
        </CustomButton>
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-loro-navy">Importation de Leads</h1>
          <p className="text-loro-hazel">Importer des leads manuellement ou via l'API</p>
        </div>
      </div>

      <Card className="border-none shadow-luxury bg-white/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full rounded-none border-b border-gray-200 bg-transparent p-0">
              <TabsTrigger 
                value="import" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-loro-terracotta data-[state=active]:shadow-none rounded-none border-b-2 border-transparent py-3 text-lg font-times text-loro-navy transition-all data-[state=active]:text-loro-terracotta"
              >
                Importer
              </TabsTrigger>
              <TabsTrigger 
                value="api" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-loro-terracotta data-[state=active]:shadow-none rounded-none border-b-2 border-transparent py-3 text-lg font-times text-loro-navy transition-all data-[state=active]:text-loro-terracotta"
              >
                API
              </TabsTrigger>
              <TabsTrigger 
                value="recents" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-loro-terracotta data-[state=active]:shadow-none rounded-none border-b-2 border-transparent py-3 text-lg font-times text-loro-navy transition-all data-[state=active]:text-loro-terracotta"
              >
                Récents
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="import" className="py-6 px-4 md:px-8 focus-visible:outline-none">
              <LeadImportForm />
            </TabsContent>
            
            <TabsContent value="api" className="py-6 px-4 md:px-8 focus-visible:outline-none">
              <LeadApiGuide />
            </TabsContent>
            
            <TabsContent value="recents" className="py-6 px-4 md:px-8 focus-visible:outline-none">
              <ImportedLeadsPanel limit={10} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadImport;
