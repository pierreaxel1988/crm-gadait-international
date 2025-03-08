
import React from 'react';
import { Filter, Plus, Settings } from 'lucide-react';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import { KanbanItem } from '@/components/kanban/KanbanCard';
import CustomButton from '@/components/ui/CustomButton';
import { LeadStatus } from '@/components/common/StatusBadge';

const mockLeads: KanbanItem[] = [
  {
    id: '1',
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    phone: '+33 6 12 34 56 78',
    status: 'Qualified',
    tags: ['Vip', 'Hot'],
    assignedTo: 'Sophie Martin',
    dueDate: 'Jun 25'
  },
  {
    id: '2',
    name: 'Marie Lambert',
    email: 'marie.lambert@example.com',
    phone: '+33 6 23 45 67 89',
    status: 'New',
    tags: ['Serious'],
    assignedTo: 'Thomas Bernard',
  },
  {
    id: '3',
    name: 'Pierre Moreau',
    email: 'pierre.moreau@example.com',
    phone: '+33 6 34 56 78 90',
    status: 'Contacted',
    tags: ['Cold', 'No response'],
    assignedTo: 'Julie Dubois',
    dueDate: 'Jun 20'
  },
  {
    id: '4',
    name: 'Claire Simon',
    email: 'claire.simon@example.com',
    status: 'Visit',
    tags: ['Hot'],
    assignedTo: 'Lucas Petit',
    dueDate: 'Jun 22'
  },
  {
    id: '5',
    name: 'Antoine Richard',
    email: 'antoine.richard@example.com',
    phone: '+33 6 56 78 90 12',
    status: 'Proposal',
    tags: ['Serious'],
    assignedTo: 'Sophie Martin',
    dueDate: 'Jun 18'
  },
  {
    id: '6',
    name: 'Camille Martin',
    email: 'camille.martin@example.com',
    phone: '+33 6 67 89 01 23',
    status: 'New',
    tags: ['No phone', 'Cold'],
  },
  {
    id: '7',
    name: 'Philippe Petit',
    email: 'philippe.petit@example.com',
    status: 'Contacted',
    tags: ['Hot'],
    assignedTo: 'Thomas Bernard',
    dueDate: 'Jun 19'
  },
  {
    id: '8',
    name: 'Sophie Dubois',
    email: 'sophie.dubois@example.com',
    phone: '+33 6 78 90 12 34',
    status: 'Deposit',
    tags: ['Vip'],
    assignedTo: 'Julie Dubois',
    dueDate: 'Jun 15'
  },
  {
    id: '9',
    name: 'Luc Martin',
    email: 'luc.martin@example.com',
    phone: '+33 6 89 01 23 45',
    status: 'Signed',
    tags: ['Vip', 'Hot'],
    assignedTo: 'Lucas Petit',
  }
];

const Kanban = () => {
  const columns = [
    {
      title: 'New',
      status: 'New' as LeadStatus,
      items: mockLeads.filter(lead => lead.status === 'New'),
    },
    {
      title: 'Contacted',
      status: 'Contacted' as LeadStatus,
      items: mockLeads.filter(lead => lead.status === 'Contacted'),
    },
    {
      title: 'Qualified',
      status: 'Qualified' as LeadStatus,
      items: mockLeads.filter(lead => lead.status === 'Qualified'),
    },
    {
      title: 'Proposal',
      status: 'Proposal' as LeadStatus,
      items: mockLeads.filter(lead => lead.status === 'Proposal'),
    },
    {
      title: 'Visit',
      status: 'Visit' as LeadStatus,
      items: mockLeads.filter(lead => lead.status === 'Visit'),
    },
    {
      title: 'Offer',
      status: 'Offer' as LeadStatus,
      items: mockLeads.filter(lead => lead.status === 'Offer'),
    },
    {
      title: 'Deposit',
      status: 'Deposit' as LeadStatus,
      items: mockLeads.filter(lead => lead.status === 'Deposit'),
    },
    {
      title: 'Signed',
      status: 'Signed' as LeadStatus,
      items: mockLeads.filter(lead => lead.status === 'Signed'),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Sales Pipeline</h1>
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
          <CustomButton className="bg-primary text-white flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> New Lead
          </CustomButton>
        </div>
      </div>

      <KanbanBoard columns={columns} />
    </div>
  );
};

export default Kanban;
