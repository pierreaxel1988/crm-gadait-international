import React from 'react';
import { LeadDetailed } from '@/types/lead';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LeadDetailTabsContent from './tabs/LeadDetailTabsContent';
import OwnerTabsContent from '../form/mobile/OwnerTabsContent';

interface LeadDetailTabsProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
  onSave: () => void;
  hasChanges: boolean;
  isSaving: boolean;
  getFormattedPhoneForCall: () => string;
  getFormattedPhoneForWhatsApp: () => string;
  startCallTracking: (type: 'phone' | 'whatsapp') => void;
}

const LeadDetailTabs: React.FC<LeadDetailTabsProps> = ({
  lead,
  onDataChange,
  onSave,
  hasChanges,
  isSaving,
  getFormattedPhoneForCall,
  getFormattedPhoneForWhatsApp,
  startCallTracking
}) => {
  const navigate = useNavigate();
  
  const handleCallClick = () => {
    const phoneNumber = getFormattedPhoneForCall();
    if (phoneNumber) {
      startCallTracking('phone');
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = getFormattedPhoneForWhatsApp();
    if (phoneNumber) {
      startCallTracking('whatsapp');
      window.open(`https://wa.me/${phoneNumber}`, '_blank');
    }
  };

  const getOwnerTabs = () => ['info', 'status', 'mandat', 'notes', 'actions'];
  const getBuyerTabs = () => ['info', 'criteria', 'notes', 'emails', 'actions'];

  const getTabLabel = (tab: string) => {
    const labels: Record<string, string> = {
      info: 'Infos',
      status: 'Statut',
      mandat: 'Mandat',
      criteria: 'Critères',
      notes: 'Notes',
      emails: 'Emails',
      actions: 'Actions'
    };
    return labels[tab] || tab;
  };

  const isOwnerPipeline = lead.pipelineType === 'owners';
  const tabs = isOwnerPipeline ? getOwnerTabs() : getBuyerTabs();

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-loro-sand px-4 py-3 border-b sticky top-0 z-50">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/pipeline')}
            className="p-1 h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            {lead.phone && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCallClick}
                  className="h-8 px-2"
                >
                  <Phone className="h-3 w-3 mr-1" />
                  <span className="text-xs">Appel</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWhatsAppClick}
                  className="h-8 px-2"
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  <span className="text-xs">WhatsApp</span>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-lg font-futura text-gray-900 truncate">{lead.name}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {lead.email && <span className="truncate">{lead.email}</span>}
            {lead.phone && <span>• {lead.phone}</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={tabs[0]} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-5 bg-gray-50 m-0 h-12 rounded-none border-b">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="text-xs font-futura data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-chocolate-dark rounded-none h-full"
            >
              {getTabLabel(tab)}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab} value={tab} className="flex-1 m-0 p-4 overflow-y-auto">
            {isOwnerPipeline ? (
              <OwnerTabsContent
                activeTab={tab}
                lead={lead}
                onDataChange={onDataChange}
              />
            ) : (
              <LeadDetailTabsContent
                activeTab={tab}
                lead={lead}
                onDataChange={onDataChange}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Save Button */}
      {hasChanges && (
        <div className="p-4 border-t bg-white sticky bottom-0">
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="w-full bg-chocolate-dark hover:bg-chocolate-dark/90 text-white font-futura"
          >
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default LeadDetailTabs;
