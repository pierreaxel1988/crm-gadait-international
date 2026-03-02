import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Download, Eye, FileText, Landmark, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

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
  hasUpcomingAction: boolean;
  lastActionDate: Date | null;
  lastActionType: string | null;
  daysSinceLastAction: number | null;
  nextActionDate: Date | null;
  nextActionType: string | null;
}

interface AgentMetrics {
  agentId: string;
  agentName: string;
  total: number;
  noAction: number;
  dormant: number;
  dormantWithAction: number;
  leads: AnalyzedLead[];
}

const STATUS_CONFIG = [
  { key: 'Visit', label: 'Visites en cours', icon: Eye, color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200' },
  { key: 'Offre', label: 'Offre en cours', icon: FileText, color: 'text-amber-600', bgColor: 'bg-amber-50 border-amber-200' },
  { key: 'Deposit', label: 'Dépôt reçu', icon: Landmark, color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' },
];

function analyzeActionHistory(actionHistory: any, now: Date): { hasNoAction: boolean; lastActionDate: Date | null; lastActionType: string | null; nextActionDate: Date | null; nextActionType: string | null } {
  if (!actionHistory || !Array.isArray(actionHistory) || actionHistory.length === 0) {
    return { hasNoAction: true, lastActionDate: null, lastActionType: null, nextActionDate: null, nextActionType: null };
  }

  const realActions = actionHistory.filter(
    (a: any) => a.actionType !== 'Creation' && a.actionType !== 'creation'
  );

  if (realActions.length === 0) {
    return { hasNoAction: true, lastActionDate: null, lastActionType: null, nextActionDate: null, nextActionType: null };
  }

  let latestDate: Date | null = null;
  let latestActionType: string | null = null;
  let nextDate: Date | null = null;
  let nextType: string | null = null;

  for (const action of realActions) {
    const dateStr = action.completedDate || action.scheduledDate || action.createdAt;
    if (dateStr) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        if (d <= now && (!latestDate || d > latestDate)) {
          latestDate = d;
          latestActionType = action.actionType || null;
        }
      }
    }
    // Check for future scheduled actions (only scheduledDate, not completed)
    const scheduledStr = action.scheduledDate;
    if (scheduledStr && !action.completedDate) {
      const sd = new Date(scheduledStr);
      if (!isNaN(sd.getTime()) && sd > now && (!nextDate || sd < nextDate)) {
        nextDate = sd;
        nextType = action.actionType || null;
      }
    }
  }

  if (!latestDate) {
    return { hasNoAction: true, lastActionDate: null, lastActionType: null, nextActionDate: nextDate, nextActionType: nextType };
  }

  return { hasNoAction: false, lastActionDate: latestDate, lastActionType: latestActionType, nextActionDate: nextDate, nextActionType: nextType };
}

const HotPipelineMonitor: React.FC = () => {
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
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
      const { hasNoAction, lastActionDate, lastActionType, nextActionDate, nextActionType } = analyzeActionHistory(lead.action_history, now);
      const daysSince = lastActionDate ? differenceInDays(now, lastActionDate) : null;
      const isDormant = !hasNoAction && daysSince !== null && daysSince > 10;
      const hasUpcoming = !!nextActionDate && differenceInDays(nextActionDate, now) <= 7;
      return {
        ...lead,
        hasNoAction,
        isDormant,
        hasUpcomingAction: hasUpcoming,
        lastActionDate,
        lastActionType,
        daysSinceLastAction: daysSince,
        nextActionDate,
        nextActionType,
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
          dormant: agentLeads.filter((l) => l.isDormant && !l.hasUpcomingAction).length,
          dormantWithAction: agentLeads.filter((l) => l.isDormant && l.hasUpcomingAction).length,
          leads: agentLeads,
        }))
        .sort((a, b) => b.total - a.total);
    }
    return result;
  }, [analyzedLeads, agentFilter, teamMap]);

  const problematicLeads = useMemo(() => {
    return analyzedLeads.filter((l) => l.hasNoAction || l.isDormant);
  }, [analyzedLeads]);

  const exportProblematicCSV = () => {
    if (problematicLeads.length === 0) {
      toast.info('Aucun lead problématique à exporter');
      return;
    }
    const data = problematicLeads.map((l) => ({
      'Nom': l.name || 'Sans nom',
      'Email': l.email || '',
      'Téléphone': l.phone || '',
      'Statut': l.status,
      'Budget': l.budget || '',
      'Agent': l.assigned_to ? (teamMap[l.assigned_to] || l.assigned_to) : 'Non assigné',
      'Alerte': l.hasNoAction ? 'Sans action' : l.isDormant ? 'Dormant' : '',
      'Dernière action': l.lastActionDate ? format(l.lastActionDate, 'dd/MM/yyyy', { locale: fr }) : '—',
      'Jours depuis dernière action': l.daysSinceLastAction ?? '',
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = Object.keys(data[0]).map((k) => ({ wch: Math.max(k.length, 18) }));
    XLSX.utils.book_append_sheet(wb, ws, 'Leads problématiques');
    XLSX.writeFile(wb, `pipeline_chaud_alertes_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast.success(`${data.length} leads exportés`);
  };

  const summaryCards = useMemo(() => {
    return STATUS_CONFIG.map((s) => {
      const statusLeads = analyzedLeads.filter((l) => l.status === s.key);
      return {
        ...s,
        total: statusLeads.length,
        noAction: statusLeads.filter((l) => l.hasNoAction).length,
        dormant: statusLeads.filter((l) => l.isDormant && !l.hasUpcomingAction).length,
        dormantWithAction: statusLeads.filter((l) => l.isDormant && l.hasUpcomingAction).length,
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
      {/* Agent filter + Export */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrer par stade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les stades</SelectItem>
              {STATUS_CONFIG.map((s) => (
                <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={exportProblematicCSV} disabled={problematicLeads.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Exporter alertes ({problematicLeads.length})
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryCards.filter((c) => statusFilter === 'all' || c.key === statusFilter).map((card) => {
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
                  {card.dormantWithAction > 0 && (
                    <span className="text-amber-600 font-medium">⏳ {card.dormantWithAction} suivi{card.dormantWithAction > 1 ? 's' : ''}</span>
                  )}
                  {card.noAction === 0 && card.dormant === 0 && card.dormantWithAction === 0 && (
                    <span className="text-green-600">✓ Tout est suivi</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail sections per status */}
      {STATUS_CONFIG.filter((s) => statusFilter === 'all' || s.key === statusFilter).map((status) => {
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
                      {agent.dormantWithAction > 0 && (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">{agent.dormantWithAction} suivi{agent.dormantWithAction > 1 ? 's' : ''}</Badge>
                      )}
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lead</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Dernière action</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Prochaine action</TableHead>
                        <TableHead>Alerte</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agent.leads.map((lead) => (
                        <TableRow
                          key={lead.id}
                          className={
                            lead.isDormant && !lead.hasUpcomingAction
                              ? 'bg-red-50'
                              : lead.isDormant && lead.hasUpcomingAction
                              ? 'bg-amber-50'
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
                          <TableCell className="text-xs text-muted-foreground">
                            <div className="flex flex-col gap-0.5">
                              {lead.email ? <a href={`mailto:${lead.email}`} className="hover:underline truncate max-w-[180px]">{lead.email}</a> : '—'}
                              {lead.phone && <a href={`tel:${lead.phone}`} className="hover:underline">{lead.phone}</a>}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{lead.budget || '—'}</TableCell>
                          <TableCell className="text-sm">
                            {lead.hasNoAction
                              ? '—'
                              : lead.daysSinceLastAction !== null
                              ? `il y a ${lead.daysSinceLastAction}j`
                              : '—'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {lead.lastActionType ? (
                              <Badge variant="outline" className="text-xs">{lead.lastActionType}</Badge>
                            ) : '—'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {lead.nextActionDate ? (
                              <span className="flex flex-col">
                                <span className="text-xs">{format(lead.nextActionDate, 'dd/MM/yyyy', { locale: fr })}</span>
                                {lead.nextActionType && (
                                  <Badge variant="outline" className="text-xs mt-0.5 w-fit">{lead.nextActionType}</Badge>
                                )}
                              </span>
                            ) : <span className="text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell>
                            {lead.isDormant && !lead.hasUpcomingAction && (
                              <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                                <AlertTriangle className="h-3.5 w-3.5" /> Dormant
                              </span>
                            )}
                            {lead.isDormant && lead.hasUpcomingAction && (
                              <span className="text-amber-600 text-sm font-medium">⏳ Action prévue</span>
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
