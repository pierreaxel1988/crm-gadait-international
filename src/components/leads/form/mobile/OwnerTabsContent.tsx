
import React from 'react';
import { LeadDetailed } from '@/types/lead';
import OptimizedOwnerInfoSection from './components/OptimizedOwnerInfoSection';
import OptimizedOwnerStatusSection from './components/OptimizedOwnerStatusSection';
import OwnerMandateSection from './components/OwnerMandateSection';
import OwnerNotesSection from './components/OwnerNotesSection';
import OwnerLocationSection from './components/OwnerLocationSection';
import OptimizedOwnerPriceFields from './components/OptimizedOwnerPriceFields';
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
            <OptimizedOwnerInfoSection lead={lead} onDataChange={onDataChange} />
            
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
              <OptimizedOwnerPriceFields lead={lead} onDataChange={onDataChange} />
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
        return <OptimizedOwnerStatusSection lead={lead} onDataChange={onDataChange} />;
      case 'mandat':
        return <OwnerMandateSection lead={lead} onDataChange={onDataChange} />;
      case 'notes':
        return <OwnerNotesSection lead={lead} onDataChange={onDataChange} />;
      case 'actions':
        return (
          <ActionsPanelMobile 
            leadId={lead.id}
            onMarkComplete={() => {}}
            onAddAction={() => {}}
          />
        );
      default:
        return <OptimizedOwnerInfoSection lead={lead} onDataChange={onDataChange} />;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'info': return 'Informations';
      case 'status': return 'Statut et Suivi';
      case 'mandat': return 'Mandat';
      case 'notes': return 'Notes';
      case 'actions': return 'Actions';
      default: return 'Informations';
    }
  };

  return (
    <div 
      className="space-y-5 pt-4" 
      style={{ marginTop: dynamicTopMargin }}
    >
      {activeTab !== 'info' && (
        <h2 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b mb-4">
          {getTabTitle()}
        </h2>
      )}
      {renderTabContent()}
    </div>
  );
};

export default OwnerTabsContent;
