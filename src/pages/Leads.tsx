
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import LeadsHeader from '@/components/leads/LeadsHeader';
import LeadsList from '@/components/leads/LeadsList';
import ImportedLeadsPanel from '@/components/leads/ImportedLeadsPanel';
import { supabase } from '@/integrations/supabase/client';
import { useSelectedAgent } from '@/hooks/useSelectedAgent';
import { useToast } from '@/hooks/use-toast';
import { FilterX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NewLeadsAlert from '@/components/notifications/NewLeadsAlert';

// Import our new components
import LeadsSearchBar from '@/components/leads/LeadsSearchBar';
import StatusFilter from '@/components/leads/filters/StatusFilter';
import TagsFilter from '@/components/leads/filters/TagsFilter';
import SelectedTagsList from '@/components/leads/filters/SelectedTagsList';

// Import required types and functions
import { LeadStatus } from '@/components/common/StatusBadge';
import { LeadTag } from '@/components/common/TagBadge';
import { getLeads, convertToSimpleLead } from '@/services/leadReader';

const Leads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | 'All'>('All');
  const [selectedTags, setSelectedTags] = useState<LeadTag[]>([]);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [importedLeadsView, setImportedLeadsView] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedAgent } = useSelectedAgent();
  const { toast } = useToast();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const allLeads = await getLeads();
        setLeads(allLeads);
      } catch (error) {
        console.error('Error fetching leads:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les leads."
        });
      }
    };
    
    fetchLeads();
  }, []);

  const toggleTag = (tag: LeadTag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const clearAllTags = () => {
    setSelectedTags([]);
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      searchTerm === '' ||
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || lead.status === selectedStatus;

    const matchesTags =
      selectedTags.length === 0 || selectedTags.some((tag) => lead.tags.includes(tag));

    return matchesSearch && matchesStatus && matchesTags;
  });

  const handleViewLead = (id: string) => {
    navigate(`/leads/${id}`);
  };

  const handleContactLead = (id: string, email: string, phone?: string) => {
    if (phone) {
      window.open(`tel:${phone}`);
    } else if (email) {
      window.open(`mailto:${email}`);
    } else {
      toast({
        title: "Information manquante",
        description: "Ce lead n'a pas de coordonnées de contact",
        variant: "destructive"
      });
    }
  };

  const handleNewLead = () => {
    navigate('/leads/new');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('All');
    setSelectedTags([]);
  };

  return (
    <>
      <Navbar />
      <SubNavigation />
      <NewLeadsAlert />
      <div className={`p-3 md:p-6 bg-white min-h-screen ${importedLeadsView ? 'overflow-hidden' : ''}`}>
        <LeadsHeader onNewLead={handleNewLead} />

        <div className="flex flex-col gap-4">
          <LeadsSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
            <StatusFilter 
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              showStatusDropdown={showStatusDropdown}
              setShowStatusDropdown={setShowStatusDropdown}
              setShowTagsDropdown={setShowTagsDropdown}
            />

            <TagsFilter 
              selectedTags={selectedTags}
              toggleTag={toggleTag}
              showTagsDropdown={showTagsDropdown}
              setShowTagsDropdown={setShowTagsDropdown}
              setShowStatusDropdown={setShowStatusDropdown}
            />
          </div>
        </div>

        <SelectedTagsList 
          selectedTags={selectedTags}
          toggleTag={toggleTag}
          clearAllTags={clearAllTags}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <LeadsList 
            leads={filteredLeads.map(lead => convertToSimpleLead(lead))}
            handleContactLead={handleContactLead}
            clearFilters={clearFilters}
          />
        </div>
      </div>
    </>
  );
};

export default Leads;
