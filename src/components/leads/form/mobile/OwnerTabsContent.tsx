
import React from 'react';
import { LeadDetailed } from '@/types/lead';
import OwnerInfoSection from './components/OwnerInfoSection';
import OwnerStatusSection from './components/OwnerStatusSection';
import OwnerNotesSection from './components/OwnerNotesSection';
import OwnerLocationSection from './components/OwnerLocationSection';
import OwnerPriceFields from './components/OwnerPriceFields';
import OwnerPropertySection from './components/OwnerPropertySection';
import ActionsPanelMobile from '@/components/leads/actions/ActionsPanelMobile';

interface OwnerTabsContentProps {
  activeTab: string;
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const OwnerTabsContent: React.FC<OwnerTabsContentProps> = ({
  activeTab,
  lead,
  onDataChange
}) => {
  const [headerHeight, setHeaderHeight] = React.useState<number>(0);
  const [isHeaderMeasured, setIsHeaderMeasured] = React.useState(false);
  
  React.useEffect(() => {
    const measureHeader = () => {
      const headerElement = document.querySelector('.bg-loro-sand');
      if (headerElement) {
        const height = headerElement.getBoundingClientRect().height;
        setHeaderHeight(height);
        setIsHeaderMeasured(true);
      }
    };
    
    measureHeader();
    window.addEventListener('resize', measureHeader);
    const timeoutId = setTimeout(measureHeader, 300);
    
    return () => {
      window.removeEventListener('resize', measureHeader);
      clearTimeout(timeoutId);
    };
  }, []);

  const dynamicTopMargin = isHeaderMeasured 
    ? `${Math.max(headerHeight + 8, 32)}px` 
    : 'calc(32px + 4rem)';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b mb-4">
                Informations personnelles
              </h3>
              <OwnerInfoSection lead={lead} onDataChange={onDataChange} />
            </div>
            <div>
              <h3 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b mb-4">
                Localisation
              </h3>
              <OwnerLocationSection lead={lead} onDataChange={onDataChange} />
            </div>
            <div>
              <h3 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b mb-4">
                Tarification
              </h3>
              <OwnerPriceFields lead={lead} onDataChange={onDataChange} />
            </div>
            <div>
              <h3 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b mb-4">
                Détails du bien
              </h3>
              <OwnerPropertySection lead={lead} onDataChange={onDataChange} />
            </div>
          </div>
        );
      case 'status':
        return <OwnerStatusSection lead={lead} onDataChange={onDataChange} />;
      case 'notes':
        return <OwnerNotesSection lead={lead} onDataChange={onDataChange} />;
      case 'actions':
        return (
          <ActionsPanelMobile 
            leadId={lead.id}
            onMarkComplete={() => {}}
            onAddAction={() => {}}
            actionHistory={lead.actionHistory || []}
          />
        );
      default:
        return <OwnerInfoSection lead={lead} onDataChange={onDataChange} />;
    }
  };

  return (
    <div 
      className="space-y-5 pt-4" 
      style={{ marginTop: dynamicTopMargin }}
    >
      {activeTab !== 'info' && (
        <h2 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b mb-4">
          {activeTab === 'status' && 'Statut et Suivi'}
          {activeTab === 'notes' && 'Notes'}
          {activeTab === 'actions' && 'Actions'}
        </h2>
      )}
      {renderTabContent()}
    </div>
  );
};

export default OwnerTabsContent;
