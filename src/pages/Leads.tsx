
import React, { useState } from 'react';
import { Check, ChevronDown, Filter, Plus, Search, Tag, X } from 'lucide-react';
import LeadCard, { Lead } from '@/components/leads/LeadCard';
import CustomButton from '@/components/ui/CustomButton';
import { LeadStatus } from '@/components/common/StatusBadge';
import { LeadTag } from '@/components/common/TagBadge';

const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    phone: '+33 6 12 34 56 78',
    location: 'Paris, France',
    status: 'Qualified',
    tags: ['Vip', 'Hot'],
    assignedTo: 'Sophie Martin',
    createdAt: '2023-06-15',
    lastContactedAt: '2023-06-18',
  },
  {
    id: '2',
    name: 'Marie Lambert',
    email: 'marie.lambert@example.com',
    phone: '+33 6 23 45 67 89',
    location: 'Lyon, France',
    status: 'New',
    tags: ['Serious'],
    assignedTo: 'Thomas Bernard',
    createdAt: '2023-06-17',
  },
  {
    id: '3',
    name: 'Pierre Moreau',
    email: 'pierre.moreau@example.com',
    phone: '+33 6 34 56 78 90',
    location: 'Nice, France',
    status: 'Contacted',
    tags: ['Cold', 'No response'],
    assignedTo: 'Julie Dubois',
    createdAt: '2023-06-14',
    lastContactedAt: '2023-06-16',
  },
  {
    id: '4',
    name: 'Claire Simon',
    email: 'claire.simon@example.com',
    location: 'Cannes, France',
    status: 'Visit',
    tags: ['Hot'],
    assignedTo: 'Lucas Petit',
    createdAt: '2023-06-12',
    lastContactedAt: '2023-06-16',
  },
  {
    id: '5',
    name: 'Antoine Richard',
    email: 'antoine.richard@example.com',
    phone: '+33 6 56 78 90 12',
    location: 'Bordeaux, France',
    status: 'Proposal',
    tags: ['Serious'],
    assignedTo: 'Sophie Martin',
    createdAt: '2023-06-10',
    lastContactedAt: '2023-06-15',
  },
  {
    id: '6',
    name: 'Camille Martin',
    email: 'camille.martin@example.com',
    phone: '+33 6 67 89 01 23',
    location: 'Marseille, France',
    status: 'New',
    tags: ['No phone', 'Cold'],
    createdAt: '2023-06-18',
  },
];

const Leads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | 'All'>('All');
  const [selectedTags, setSelectedTags] = useState<LeadTag[]>([]);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);

  const statuses: (LeadStatus | 'All')[] = [
    'All',
    'New',
    'Contacted',
    'Qualified',
    'Proposal',
    'Visit',
    'Offer',
    'Deposit',
    'Signed',
  ];

  const tags: LeadTag[] = [
    'Vip',
    'Hot',
    'Serious',
    'Cold',
    'No response',
    'No phone',
    'Fake',
  ];

  const toggleTag = (tag: LeadTag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const filteredLeads = mockLeads.filter((lead) => {
    // Filter by search term (name or email)
    const matchesSearch =
      searchTerm === '' ||
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by status
    const matchesStatus = selectedStatus === 'All' || lead.status === selectedStatus;

    // Filter by tags
    const matchesTags =
      selectedTags.length === 0 || selectedTags.some((tag) => lead.tags.includes(tag));

    return matchesSearch && matchesStatus && matchesTags;
  });

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Leads</h1>
          <p className="text-muted-foreground">Manage your leads and prospects</p>
        </div>
        <CustomButton className="bg-primary text-white flex items-center gap-1.5 w-full sm:w-auto">
          <Plus className="h-4 w-4" /> New Lead
        </CustomButton>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="luxury-input pl-10 w-full"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
          <div className="relative w-full sm:w-auto">
            <button
              className="luxury-input pl-3 pr-10 flex items-center gap-2 w-full justify-between"
              onClick={() => {
                setShowStatusDropdown(!showStatusDropdown);
                setShowTagsDropdown(false);
              }}
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>{selectedStatus}</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>
            {showStatusDropdown && (
              <div className="absolute left-0 right-0 sm:left-auto sm:w-48 mt-1 bg-card rounded-md border border-border shadow-luxury z-10">
                <div className="py-1">
                  {statuses.map((status) => (
                    <button
                      key={status}
                      className="flex items-center justify-between w-full px-4 py-2 text-sm text-foreground hover:bg-accent"
                      onClick={() => {
                        setSelectedStatus(status);
                        setShowStatusDropdown(false);
                      }}
                    >
                      {status}
                      {selectedStatus === status && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative w-full sm:w-auto">
            <button
              className="luxury-input pl-3 pr-10 flex items-center gap-2 w-full justify-between"
              onClick={() => {
                setShowTagsDropdown(!showTagsDropdown);
                setShowStatusDropdown(false);
              }}
            >
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span>
                  {selectedTags.length === 0
                    ? 'Tags'
                    : `${selectedTags.length} selected`}
                </span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>
            {showTagsDropdown && (
              <div className="absolute left-0 right-0 sm:left-auto sm:w-48 mt-1 bg-card rounded-md border border-border shadow-luxury z-10">
                <div className="py-1">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      className="flex items-center justify-between w-full px-4 py-2 text-sm text-foreground hover:bg-accent"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                      {selectedTags.includes(tag) && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <div
              key={tag}
              className="flex items-center gap-1 bg-accent text-accent-foreground rounded-full pl-3 pr-2 py-1 text-xs"
            >
              {tag}
              <button onClick={() => toggleTag(tag)}>
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setSelectedTags([])}
          >
            Clear all
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredLeads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}

        {filteredLeads.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <p className="text-center text-muted-foreground mb-4">No leads found matching your filters</p>
            <CustomButton
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('All');
                setSelectedTags([]);
              }}
            >
              Clear filters
            </CustomButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leads;
