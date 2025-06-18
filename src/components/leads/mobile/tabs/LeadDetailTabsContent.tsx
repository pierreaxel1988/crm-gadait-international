
import React from 'react';
import { LeadDetailed } from '@/types/lead';
import BuyerCriteriaSection from '../../form/mobile/components/BuyerCriteriaSection';
import GeneralInfoSection from '../../form/mobile/GeneralInfoSection';
import NotesSection from '../../form/mobile/NotesSection';
import EmailsTab from './EmailsTab';
import ActionsPanelMobile from '../../actions/ActionsPanelMobile';

interface LeadDetailTabsContentProps {
  activeTab: string;
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const LeadDetailTabsContent: React.FC<LeadDetailTabsContentProps> = ({
  activeTab,
  lead,
  onDataChange
}) => {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return <GeneralInfoSection lead={lead} onDataChange={onDataChange} />;
      case 'criteria':
        return <BuyerCriteriaSection lead={lead} onDataChange={onDataChange} />;
      case 'notes':
        return <NotesSection lead={lead} onDataChange={onDataChange} />;
      case 'emails':
        return <EmailsTab leadId={lead.id} />;
      case 'actions':
        return (
          <ActionsPanelMobile 
            leadId={lead.id}
            onMarkComplete={() => {}}
            onAddAction={() => {}}
          />
        );
      default:
        return <GeneralInfoSection lead={lead} onDataChange={onDataChange} />;
    }
  };

  return (
    <div className="space-y-5 pt-4">
      {renderTabContent()}
    </div>
  );
};

export default LeadDetailTabsContent;
