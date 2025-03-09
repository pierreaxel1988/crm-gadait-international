import React, { useState } from 'react';
import { Filter, Plus, Settings, Home, Key } from 'lucide-react';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import { KanbanItem } from '@/components/kanban/KanbanCard';
import CustomButton from '@/components/ui/CustomButton';
import { LeadStatus } from '@/components/common/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for purchase leads
const mockPurchaseLeads: KanbanItem[] = [
  {
    id: '1',
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    phone: '+33 6 12 34 56 78',
    status: 'Qualified',
    tags: ['Vip', 'Hot'],
    assignedTo: 'Sophie Martin',
    dueDate: 'Jun 25',
    pipelineType: 'purchase',
    taskType: 'Visites'
  },
  {
    id: '2',
    name: 'Marie Lambert',
    email: 'marie.lambert@example.com',
    phone: '+33 6 23 45 67 89',
    status: 'New',
    tags: ['Serious'],
    assignedTo: 'Thomas Bernard',
    pipelineType: 'purchase',
    taskType: 'Call'
  },
  {
    id: '5',
    name: 'Antoine Richard',
    email: 'antoine.richard@example.com',
    phone: '+33 6 56 78 90 12',
    status: 'Proposal',
    tags: ['Serious'],
    assignedTo: 'Sophie Martin',
    dueDate: 'Jun 18',
    pipelineType: 'purchase',
    taskType: 'Propositions'
  },
  {
    id: '8',
    name: 'Sophie Dubois',
    email: 'sophie.dubois@example.com',
    phone: '+33 6 78 90 12 34',
    status: 'Deposit',
    tags: ['Vip'],
    assignedTo: 'Julie Dubois',
    dueDate: 'Jun 15',
    pipelineType: 'purchase',
    taskType: 'Compromis'
  },
  {
    id: '9',
    name: 'Luc Martin',
    email: 'luc.martin@example.com',
    phone: '+33 6 89 01 23 45',
    status: 'Signed',
    tags: ['Vip', 'Hot'],
    assignedTo: 'Lucas Petit',
    pipelineType: 'purchase',
    taskType: 'Acte de vente'
  }
];

// Mock data for rental leads
const mockRentalLeads: KanbanItem[] = [
  {
    id: '3',
    name: 'Pierre Moreau',
    email: 'pierre.moreau@example.com',
    phone: '+33 6 34 56 78 90',
    status: 'Contacted',
    tags: ['Cold', 'No response'],
    assignedTo: 'Julie Dubois',
    dueDate: 'Jun 20',
    pipelineType: 'rental',
    taskType: 'Follow up'
  },
  {
    id: '4',
    name: 'Claire Simon',
    email: 'claire.simon@example.com',
    status: 'Visit',
    tags: ['Hot'],
    assignedTo: 'Lucas Petit',
    dueDate: 'Jun 22',
    pipelineType: 'rental',
    taskType: 'Visites'
  },
  {
    id: '6',
    name: 'Camille Martin',
    email: 'camille.martin@example.com',
    phone: '+33 6 67 89 01 23',
    status: 'New',
    tags: ['No phone', 'Cold'],
    pipelineType: 'rental',
    taskType: 'Prospection'
  },
  {
    id: '7',
    name: 'Philippe Petit',
    email: 'philippe.petit@example.com',
    status: 'Contacted',
    tags: ['Hot'],
    assignedTo: 'Thomas Bernard',
    dueDate: 'Jun 19',
    pipelineType: 'rental',
    taskType: 'Estimation'
  }
];

const Kanban = () => {
  const [activeTab, setActiveTab] = useState<string>("purchase");
  const navigate = useNavigate();

  const purchaseColumns = [
    {
      title: 'New',
      status: 'New' as LeadStatus,
      items: mockPurchaseLeads.filter(lead => lead.status === 'New'),
    },
    {
      title: 'Contacted',
      status: 'Contacted' as LeadStatus,
      items: mockPurchaseLeads.filter(lead => lead.status === 'Contacted'),
    },
    {
      title: 'Qualified',
      status: 'Qualified' as LeadStatus,
      items: mockPurchaseLeads.filter(lead => lead.status === 'Qualified'),
    },
    {
      title: 'Proposal',
      status: 'Proposal' as LeadStatus,
      items: mockPurchaseLeads.filter(lead => lead.status === 'Proposal'),
    },
    {
      title: 'Visit',
      status: 'Visit' as LeadStatus,
      items: mockPurchaseLeads.filter(lead => lead.status === 'Visit'),
    },
    {
      title: 'Offer',
      status: 'Offer' as LeadStatus,
      items: mockPurchaseLeads.filter(lead => lead.status === 'Offer'),
    },
    {
      title: 'Deposit',
      status: 'Deposit' as LeadStatus,
      items: mockPurchaseLeads.filter(lead => lead.status === 'Deposit'),
    },
    {
      title: 'Signed',
      status: 'Signed' as LeadStatus,
      items: mockPurchaseLeads.filter(lead => lead.status === 'Signed'),
    },
  ];

  const rentalColumns = [
    {
      title: 'New',
      status: 'New' as LeadStatus,
      items: mockRentalLeads.filter(lead => lead.status === 'New'),
    },
    {
      title: 'Contacted',
      status: 'Contacted' as LeadStatus,
      items: mockRentalLeads.filter(lead => lead.status === 'Contacted'),
    },
    {
      title: 'Qualified',
      status: 'Qualified' as LeadStatus,
      items: mockRentalLeads.filter(lead => lead.status === 'Qualified'),
    },
    {
      title: 'Visit',
      status: 'Visit' as LeadStatus,
      items: mockRentalLeads.filter(lead => lead.status === 'Visit'),
    },
    {
      title: 'Application',
      status: 'Proposal' as LeadStatus,
      items: mockRentalLeads.filter(lead => lead.status === 'Proposal'),
    },
    {
      title: 'Approval',
      status: 'Offer' as LeadStatus,
      items: mockRentalLeads.filter(lead => lead.status === 'Offer'),
    },
    {
      title: 'Lease Signed',
      status: 'Signed' as LeadStatus,
      items: mockRentalLeads.filter(lead => lead.status === 'Signed'),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-timesNowSemi text-3xl font-normal text-[rgb(18,16,16)] leading-[28px]">Sales Pipeline</h1>
          <p className="text-muted-foreground">Drag and drop leads through your sales stages</p>
        </div>
        <div className="flex space-x-3">
          <CustomButton
            variant="outline"
            className="flex items-center gap-1.5"
          >
            <Filter className="h-4 w-4" /> Filter
          </CustomButton>
          <CustomButton
            variant="outline"
            className="flex items-center gap-1.5"
          >
            <Settings className="h-4 w-4" /> Customize
          </CustomButton>
          <CustomButton 
            variant="chocolate" 
            className="flex items-center gap-1.5"
            onClick={() => navigate('/leads/new')}
          >
            <Plus className="h-4 w-4" /> New Lead
          </CustomButton>
        </div>
      </div>

      <Tabs defaultValue="purchase" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 w-[400px] mx-auto">
          <TabsTrigger value="purchase" className="flex items-center gap-2 w-1/2">
            <Home className="h-4 w-4" />
            <span>Achat (Purchase)</span>
          </TabsTrigger>
          <TabsTrigger value="rental" className="flex items-center gap-2 w-1/2">
            <Key className="h-4 w-4" />
            <span>Location (Rental)</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="purchase" className="mt-0">
          <KanbanBoard columns={purchaseColumns} />
        </TabsContent>
        
        <TabsContent value="rental" className="mt-0">
          <KanbanBoard columns={rentalColumns} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Kanban;
