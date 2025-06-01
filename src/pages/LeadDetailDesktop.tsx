
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLeadDetail } from '@/hooks/useLeadDetail';
import { ArrowLeft, Loader2 } from 'lucide-react';
import LeadHeader from '@/components/leads/LeadHeader';
import ChatGadaitFloatingButton from '@/components/chat/ChatGadaitFloatingButton';

// Import components from correct paths
import LeadInfoTab from '@/components/leads/LeadInfoTab';
import ActionsTab from '@/components/leads/ActionsTab';
import NotesTab from '@/components/leads/NotesTab';
import PropertiesTab from '@/components/leads/PropertiesTab';
import DocumentsTab from '@/components/leads/DocumentsTab';
import ContactsTab from '@/components/leads/ContactsTab';

// Layout wrapper component to avoid import error
const SidebarLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-loro-pearl/10">
    <div className="flex">
      <div className="w-full">{children}</div>
    </div>
  </div>
);

const LeadDetailDesktop = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('info');
  const { lead, isLoading: loading, handleDataChange } = useLeadDetail(id!);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Déterminer l'onglet actif depuis les paramètres d'URL ou utiliser "info" par défaut
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  const handleLeadUpdate = (updatedLead: any) => {
    if (handleDataChange) {
      handleDataChange(updatedLead);
    }
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Loader2 className="h-10 w-10 animate-spin text-loro-hazel" />
          <p className="mt-4 text-loro-navy">Chargement des détails du lead...</p>
        </div>
      </SidebarLayout>
    );
  }

  if (errorMessage || !lead) {
    return (
      <SidebarLayout>
        <div className="p-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 text-loro-terracotta"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <p className="text-red-500 font-medium">
              {errorMessage || "Ce lead n'existe pas ou vous n'avez pas les droits d'accès."}
            </p>
            <Button 
              onClick={() => navigate('/leads')} 
              className="mt-4 bg-loro-terracotta hover:bg-loro-terracotta/90 rounded-md"
            >
              Retour à la liste des leads
            </Button>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  // Calculer le nombre d'actions en attente
  const pendingActions = lead.actionHistory?.filter(
    action => !action.completedDate
  ).length || 0;

  return (
    <SidebarLayout>
      <div className="px-[100px] py-6 max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-loro-terracotta rounded-md"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <LeadHeader 
          lead={lead} 
          onBack={() => navigate(-1)}
          onAddAction={() => {}}
          onDelete={() => {}}
        />
        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-6 bg-loro-pearl/20 p-1 rounded-lg w-full flex flex-wrap">
              <TabsTrigger 
                value="info"
                className="data-[state=active]:text-loro-terracotta data-[state=active]:font-medium data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:w-full data-[state=active]:after:h-[2px] data-[state=active]:after:bg-loro-terracotta relative rounded-md"
              >Informations</TabsTrigger>
              <TabsTrigger 
                value="actions"
                className="data-[state=active]:text-loro-terracotta data-[state=active]:font-medium data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:w-full data-[state=active]:after:h-[2px] data-[state=active]:after:bg-loro-terracotta relative rounded-md"
              >
                Actions
                {pendingActions > 0 && (
                  <div className="absolute -top-2 -right-1 bg-loro-terracotta text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {pendingActions}
                  </div>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="notes"
                className="data-[state=active]:text-loro-terracotta data-[state=active]:font-medium data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:w-full data-[state=active]:after:h-[2px] data-[state=active]:after:bg-loro-terracotta relative rounded-md"
              >Notes</TabsTrigger>
              <TabsTrigger 
                value="properties"
                className="data-[state=active]:text-loro-terracotta data-[state=active]:font-medium data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:w-full data-[state=active]:after:h-[2px] data-[state=active]:after:bg-loro-terracotta relative rounded-md"
              >Propriétés</TabsTrigger>
              <TabsTrigger 
                value="documents"
                className="data-[state=active]:text-loro-terracotta data-[state=active]:font-medium data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:w-full data-[state=active]:after:h-[2px] data-[state=active]:after:bg-loro-terracotta relative rounded-md"
              >Documents</TabsTrigger>
              <TabsTrigger 
                value="contacts"
                className="data-[state=active]:text-loro-terracotta data-[state=active]:font-medium data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:w-full data-[state=active]:after:h-[2px] data-[state=active]:after:bg-loro-terracotta relative rounded-md"
              >Contacts</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="rounded-lg overflow-hidden">
              <LeadInfoTab lead={lead} onLeadUpdate={handleLeadUpdate} />
            </TabsContent>
            <TabsContent value="actions" className="rounded-lg overflow-hidden">
              <ActionsTab lead={lead} onLeadUpdate={handleLeadUpdate} />
              {/* ChatGadait floating button - uniquement dans l'onglet actions */}
              <ChatGadaitFloatingButton leadData={lead} position="bottom-right" />
            </TabsContent>
            <TabsContent value="notes" className="rounded-lg overflow-hidden">
              <NotesTab lead={lead} onLeadUpdate={handleLeadUpdate} />
            </TabsContent>
            <TabsContent value="properties" className="rounded-lg overflow-hidden">
              <PropertiesTab leadId={lead.id} lead={lead} />
            </TabsContent>
            <TabsContent value="documents" className="rounded-lg overflow-hidden">
              <DocumentsTab leadId={lead.id} />
            </TabsContent>
            <TabsContent value="contacts" className="rounded-lg overflow-hidden">
              <ContactsTab leadId={lead.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default LeadDetailDesktop;
