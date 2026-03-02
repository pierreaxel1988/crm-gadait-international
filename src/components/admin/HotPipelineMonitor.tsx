import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Eye, FileText, Landmark, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { differenceInDays } from 'date-fns';

interface LeadRow {
  id: string;
  name: string;
  status: string;
  assigned_to: string | null;
  action_history: any;
  email: string | null;
  phone: string | null;
  budget: string | null;
}

interface TeamMember {
  id: string;
  name: string;
}

interface AnalyzedLead extends LeadRow {
  hasNoAction: boolean;
  isDormant: boolean;
  lastActionDate: Date | null;
  daysSinceLastAction: number | null;
}

interface AgentMetrics {
  agentId: string;
  agentName: string;
  total: number;
  noAction: number;
  dormant: number;
  leads: AnalyzedLead[];
}

const STATUS_CONFIG = [
  { key: 'Visit', label: 'Visites en cours', icon: Eye, color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200' },
  { key: 'Offre', label: 'Offre en cours', icon: FileText, color: 'text-amber-600', bgColor: 'bg-amber-50 border-amber-200' },
  { key: 'Deposit', label: 'Dépôt reçu', icon: Landmark, color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' },
];

function analyzeActionHistory(actionHistory: any): { hasNoAction: boolean; lastActionDate: Date | null } {
  if (!actionHistory || !Array.isArray(actionHistory) || actionHistory.length === 0) {
    return { hasNoAction: true, lastActionDate: null };
  }

  const realActions = actionHistory.filter(
    (a: any) => a.actionType !== 'Creation' && a.actionType !== 'creation'
  );

  if (realActions.length === 0) {
    return { hasNoAction: true, lastActionDate: null };
  }

  let latestDate: Date | null = null;
  for (const action of realActions) {
    const dateStr = action.completedDate || action.scheduledDate || action.createdAt;
    if (dateStr) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime()) && (!latestDate || d > latestDate)) {
        latestDate = d;
      }
    }
  }

  return { hasNoAction: false, lastActionDate: latestDate };
}

const HotPipelineMonitor: React.FC = () => {
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const navigate = useNavigate();

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members-hot'],
    queryFn: async () => {
      const { data } = await supabase.from('team_members').select('id, name').order('name');
      return (data || []) as TeamMember[];
    },
  });

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['hot-pipeline-leads'],
    queryFn: async () => {
      const { data } = await supabase
        .from('leads')
        .select('id, name, status, assigned_to, action_history, email, phone, budget')
        .eq('pipeline_type', 'purchase')
        .in('status', ['Visit', 'Offre', 'Deposit'])
        .is('deleted_at', null);
      return (data || []) as LeadRow[];
    },
  });

  const teamMap = useMemo(() => {
    const m: Record<string, string> = {};
    teamMembers.forEach((t) => (m[t.id] = t.name));
    return m;
  }, [teamMembers]);

  const analyzedLeads = useMemo<AnalyzedLead[]>(() => {
    const now = new Date();
    return leads.map((lead) => {
      const { hasNoAction, lastActionDate } = analyzeActionHistory(lead.action_history);
      const daysSince = lastActionDate ? differenceInDays(now, lastActionDate) : null;
      return {
        ...lead,
        hasNoAction,
        isDormant: !hasNoAction && daysSince !== null && daysSince > 10,
        lastActionDate,
        daysSinceLastAction: daysSince,
      };
    });
  }, [leads]);

  const metricsByStatus = useMemo(() => {
    const result: Record<string, AgentMetrics[]> = {};

    for (const status of STATUS_CONFIG) {
      const statusLeads = analyzedLeads.filter((l) => l.status === status.key);
      const filtered = agentFilter === 'all' ? statusLeads : statusLeads.filter((l) => l.assigned_to === agentFilter);

      const agentGroups: Record<string, AnalyzedLead[]> = {};
      filtered.forEach((l) => {
        const key = l.assigned_to || 'unassigned';
        if (!agentGroups[key]) agentGroups[key] = [];
        agentGroups[key].push(l);
      });

      result[status.key] = Object.entries(agentGroups)
        .map(([agentId, agentLeads]) => ({
          agentId,
          agentName: agentId === 'unassigned' ? 'Non assigné' : teamMap[agentId] || agentId,
          total: agentLeads.length,
          noAction: agentLeads.filter((l) => l.hasNoAction).length,
          dormant: agentLeads.filter((l) => l.isDormant).length,
          leads: agentLeads,
        }))
        .sort((a, b) => b.total - a.total);
    }
    return result;
  }, [analyzedLeads, agentFilter, teamMap]);

  const summaryCards = useMemo(() => {
    return STATUS_CONFIG.map((s) => {
      const statusLeads = analyzedLeads.filter((l) => l.status === s.key);
      return {
        ...s,
        total: statusLeads.length,
        noAction: statusLeads.filter((l) => l.hasNoAction).length,
        dormant: statusLeads.filter((l) => l.isDormant).length,
      };
    });
  }, [analyzedLeads]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agent filter */}
      <div className="flex items-center gap-3">
        <Users className="h-4 w-4 text-muted-foreground" />
        <Select value={agentFilter} onValueChange={setAgentFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filtrer par agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les agents</SelectItem>
            {teamMembers.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.key} className={`border ${card.bgColor}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${card.color}`} />
                  {card.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.total}</div>
                <div className="flex gap-3 mt-2 text-sm">
                  {card.noAction > 0 && (
                    <span className="text-orange-600 font-medium">⚠ {card.noAction} sans action</span>
                  )}
                  {card.dormant > 0 && (
                    <span className="text-red-600 font-medium">🔴 {card.dormant} dormant{card.dormant > 1 ? 's' : ''}</span>
                  )}
                  {card.noAction === 0 && card.dormant === 0 && (
                    <span className="text-green-600">✓ Tout est suivi</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail sections per status */}
      {STATUS_CONFIG.map((status) => {
        const agents = metricsByStatus[status.key] || [];
        const Icon = status.icon;
        if (agents.length === 0) return null;

        return (
          <Card key={status.key}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon className={`h-5 w-5 ${status.color}`} />
                {status.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {agents.map((agent) => (
                <div key={agent.agentId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{agent.agentName}</h4>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{agent.total} lead{agent.total > 1 ? 's' : ''}</Badge>
                      {agent.noAction > 0 && (
                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">{agent.noAction} sans action</Badge>
                      )}
                      {agent.dormant > 0 && (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{agent.dormant} dormant{agent.dormant > 1 ? 's' : ''}</Badge>
                      )}
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lead</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Dernière action</TableHead>
                        <TableHead>Alerte</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agent.leads.map((lead) => (
                        <TableRow
                          key={lead.id}
                          className={
                            lead.isDormant
                              ? 'bg-red-50'
                              : lead.hasNoAction
                              ? 'bg-orange-50'
                              : ''
                          }
                        >
                          <TableCell>
                            <button
                              className="text-primary underline hover:no-underline font-medium text-left"
                              onClick={() => navigate(`/leads/${lead.id}`)}
                            >
                              {lead.name || 'Sans nom'}
                            </button>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{lead.email || '—'}</TableCell>
                          <TableCell className="text-sm">{lead.budget || '—'}</TableCell>
                          <TableCell className="text-sm">
                            {lead.hasNoAction
                              ? '—'
                              : lead.daysSinceLastAction !== null
                              ? `il y a ${lead.daysSinceLastAction}j`
                              : '—'}
                          </TableCell>
                          <TableCell>
                            {lead.isDormant && (
                              <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                                <AlertTriangle className="h-3.5 w-3.5" /> Dormant
                              </span>
                            )}
                            {lead.hasNoAction && (
                              <span className="text-orange-600 text-sm font-medium">Sans action</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default HotPipelineMonitor;
