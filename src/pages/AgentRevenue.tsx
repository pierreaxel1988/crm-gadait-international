import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, TrendingUp, DollarSign, Hash, Percent } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import { GUARANTEED_TEAM_MEMBERS } from '@/services/teamMemberService';
import { useSelectedAgent } from '@/hooks/useSelectedAgent';

interface Deal {
  id: string;
  lead_id: string | null;
  lead_name: string;
  agent_id: string | null;
  sale_price: number;
  commission_percentage: number;
  commission_amount: number;
  lead_source: string | null;
  pipeline_type: string | null;
  deal_date: string;
  currency: string;
  notes: string | null;
  status: string;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  offer: 'Contrat en cours',
  deposit: 'Dépôt reçu',
  signed: 'Signé',
  won: 'Gagné',
};

const STATUS_COLORS: Record<string, string> = {
  offer: 'bg-purple-100 text-purple-800',
  deposit: 'bg-amber-100 text-amber-800',
  signed: 'bg-blue-100 text-blue-800',
  won: 'bg-emerald-100 text-emerald-800',
};

const AgentRevenue = () => {
  const { user, userName, isAdmin } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedAgent, handleAgentChange } = useSelectedAgent();

  const selectedAgentName = useMemo(() => {
    if (!selectedAgent) return null;
    const member = GUARANTEED_TEAM_MEMBERS.find(m => m.id === selectedAgent);
    return member ? member.name : null;
  }, [selectedAgent]);

  // Filters
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const allMembers = GUARANTEED_TEAM_MEMBERS
    .filter(m => m.role === 'agent' || m.role === 'admin')
    .sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    if (!user?.email) return;

    const fetchAgentAndDeals = async () => {
      setLoading(true);
      
      const { data: member } = await supabase
        .from('team_members')
        .select('id')
        .eq('email', user.email!)
        .single();

      if (member) {
        const targetAgentId = (isAdmin && selectedAgent) ? selectedAgent : member.id;
        
        const { data: dealsData } = await supabase
          .from('deals')
          .select('*')
          .eq('agent_id', targetAgentId)
          .order('deal_date', { ascending: false });

        if (dealsData) setDeals(dealsData as Deal[]);
      }
      
      setLoading(false);
    };

    fetchAgentAndDeals();
  }, [user?.email, isAdmin, selectedAgent]);

  const filteredDeals = useMemo(() => {
    return deals.filter(d => {
      if (filterSource !== 'all' && d.lead_source !== filterSource) return false;
      if (filterStatus !== 'all' && d.status !== filterStatus) return false;
      return true;
    });
  }, [deals, filterSource, filterStatus]);

  // Stats
  const totalCA = filteredDeals.reduce((s, d) => s + (d.sale_price || 0), 0);
  const totalCommission = filteredDeals.reduce((s, d) => s + (d.commission_amount || 0), 0);
  const avgCommPct = filteredDeals.length > 0
    ? filteredDeals.reduce((s, d) => s + (d.commission_percentage || 0), 0) / filteredDeals.length
    : 0;

  const sources = [...new Set(deals.map(d => d.lead_source).filter(Boolean))];

  const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

  const exportCSV = () => {
    const header = 'Lead,Prix de vente,% Commission,Montant commission,Source,Pipeline,Date,Statut\n';
    const rows = filteredDeals.map(d =>
      `"${d.lead_name}",${d.sale_price},${d.commission_percentage},${d.commission_amount},"${d.lead_source || ''}","${d.pipeline_type || ''}",${d.deal_date},"${STATUS_LABELS[d.status] || d.status}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `mon_ca_${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SubNavigation />
      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-normal text-foreground">
            {isAdmin && selectedAgent ? 'Chiffre d\'Affaire' : 'Mon Chiffre d\'Affaire'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin && selectedAgent 
              ? `Deals de ${selectedAgentName || 'Agent'}` 
              : userName ? `Deals de ${userName}` : 'Vos deals personnels'}
          </p>
        </div>

        {/* Agent filter for admins */}
        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!selectedAgent ? 'default' : 'outline'}
              size="sm"
              className="text-xs"
              onClick={() => handleAgentChange(null)}
            >
              Mes deals
            </Button>
            {allMembers.map(m => (
              <Button
                key={m.id}
                variant={selectedAgent === m.id ? 'default' : 'outline'}
                size="sm"
                className="text-xs"
                onClick={() => handleAgentChange(m.id)}
              >
                {m.name.split(' ')[0]}
              </Button>
            ))}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-background border rounded-lg p-4 space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><DollarSign className="h-4 w-4" /> CA Total</div>
            <p className="text-2xl font-normal">{fmt(totalCA)}</p>
          </div>
          <div className="bg-background border rounded-lg p-4 space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><TrendingUp className="h-4 w-4" /> Total Commissions</div>
            <p className="text-2xl font-normal">{fmt(totalCommission)}</p>
          </div>
          <div className="bg-background border rounded-lg p-4 space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Percent className="h-4 w-4" /> Commission Moy.</div>
            <p className="text-2xl font-normal">{avgCommPct.toFixed(1)}%</p>
          </div>
          <div className="bg-background border rounded-lg p-4 space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Hash className="h-4 w-4" /> Nombre de deals</div>
            <p className="text-2xl font-normal">{filteredDeals.length}</p>
          </div>
        </div>

        {/* Actions bar - no agent filter, no add button */}
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1"><Download className="h-4 w-4" /> Export CSV</Button>

          <Select value={filterSource} onValueChange={setFilterSource}>
            <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les sources</SelectItem>
              {sources.map(s => <SelectItem key={s!} value={s!}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="offer">Contrat en cours</SelectItem>
              <SelectItem value="deposit">Dépôt reçu</SelectItem>
              <SelectItem value="signed">Signé</SelectItem>
              <SelectItem value="won">Gagné</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Deals Table */}
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : filteredDeals.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Aucun deal enregistré pour le moment.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Pipeline</TableHead>
                <TableHead className="text-right">Prix de vente</TableHead>
                <TableHead className="text-right">%</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeals.map(deal => (
                <TableRow key={deal.id}>
                  <TableCell className="font-normal text-sm">{deal.lead_name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground capitalize">{deal.pipeline_type || '—'}</TableCell>
                  <TableCell className="text-right text-sm font-normal">{fmt(deal.sale_price)}</TableCell>
                  <TableCell className="text-right text-xs">{deal.commission_percentage}%</TableCell>
                  <TableCell className="text-right text-sm font-normal text-emerald-700">{fmt(deal.commission_amount)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{deal.lead_source || '—'}</TableCell>
                  <TableCell className="text-xs">{format(new Date(deal.deal_date), 'dd MMM yyyy', { locale: fr })}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[deal.status] || 'bg-muted'}`}>
                      {STATUS_LABELS[deal.status] || deal.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
              <TableCell colSpan={2} className="font-normal">Total ({filteredDeals.length} deals)</TableCell>
                <TableCell className="text-right font-normal">{fmt(totalCA)}</TableCell>
                <TableCell className="text-right text-xs">{avgCommPct.toFixed(1)}%</TableCell>
                <TableCell className="text-right font-normal text-emerald-700">{fmt(totalCommission)}</TableCell>
                <TableCell colSpan={3}></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </div>
    </div>
  );
};

export default AgentRevenue;
