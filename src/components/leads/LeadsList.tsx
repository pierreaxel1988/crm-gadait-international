
import React from 'react';
import { Lead } from '@/components/leads/LeadCard';
import LeadCard from '@/components/leads/LeadCard';
import CustomButton from '@/components/ui/CustomButton';

interface LeadsListProps {
  leads: Lead[];
  handleContactLead: (id: string, email: string, phone?: string) => void;
  clearFilters: () => void;
}

const LeadsList: React.FC<LeadsListProps> = ({ leads, handleContactLead, clearFilters }) => {
  if (leads.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-12">
        <p className="text-center text-muted-foreground mb-4">Aucun lead trouvé correspondant à vos filtres</p>
        <CustomButton
          variant="outline"
          onClick={clearFilters}
        >
          Effacer les filtres
        </CustomButton>
      </div>
    );
  }

  return (
    <>
      {leads.map((lead) => (
        <LeadCard 
          key={lead.id} 
          lead={lead}
          onContact={() => handleContactLead(lead.id, lead.email, lead.phone)}
        />
      ))}
    </>
  );
};

export default LeadsList;
