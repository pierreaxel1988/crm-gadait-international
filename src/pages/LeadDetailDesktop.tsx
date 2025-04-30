
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLeadDetail } from '@/hooks/useLeadDetail';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { ArrowLeft, Loader2 } from 'lucide-react';
import LeadHeader from '@/components/leads/LeadHeader';
import LeadInfoTab from '@/components/leads/desktop/tabs/LeadInfoTab';
import ActionsTab from '@/components/leads/desktop/tabs/ActionsTab';
import NotesTab from '@/components/leads/desktop/tabs/NotesTab';
import PropertiesTab from '@/components/leads/desktop/tabs/PropertiesTab';
import DocumentsTab from '@/components/leads/desktop/tabs/DocumentsTab';
import ContactsTab from '@/components/leads/desktop/tabs/ContactsTab';
import EmailsTabDesktop from '@/components/leads/desktop/tabs/EmailsTabDesktop';

const LeadDetailDesktop = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('info');
  const { lead, loading, error } = useLeadDetail(id!);

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

  if (error || !lead) {
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
              {error || "Ce lead n'existe pas ou vous n'avez pas les droits d'accès."}
            </p>
            <Button 
              onClick={() => navigate('/leads')} 
              className="mt-4 bg-loro-terracotta hover:bg-loro-terracotta/90"
            >
              Retour à la liste des leads
            </Button>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-loro-terracotta"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <LeadHeader lead={lead} />
        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-6 bg-loro-pearl/20 p-1 rounded-lg w-full flex flex-wrap">
              <TabsTrigger value="info">Informations</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="properties">Propriétés</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="emails">Emails</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <LeadInfoTab lead={lead} />
            </TabsContent>
            <TabsContent value="actions">
              <ActionsTab leadId={lead.id} />
            </TabsContent>
            <TabsContent value="notes">
              <NotesTab leadId={lead.id} />
            </TabsContent>
            <TabsContent value="properties">
              <PropertiesTab leadId={lead.id} lead={lead} />
            </TabsContent>
            <TabsContent value="documents">
              <DocumentsTab leadId={lead.id} />
            </TabsContent>
            <TabsContent value="contacts">
              <ContactsTab leadId={lead.id} />
            </TabsContent>
            <TabsContent value="emails">
              <EmailsTabDesktop leadId={lead.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default LeadDetailDesktop;
