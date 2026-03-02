import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Download, TrendingUp, DollarSign, Hash, Percent, Trash2, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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

interface TeamMember {
  id: string;
  name: string;
}

interface LeadOption {
  id: string;
  name: string;
  source: string | null;
  pipeline_type: string | null;
  status: string;
}

const STATUS_LABELS: Record<string, string> = {
  deposit: 'Dépôt reçu',
  signed: 'Signé',
  won: 'Gagné',
};

const STATUS_COLORS: Record<string, string> = {
  deposit: 'bg-amber-100 text-amber-800',
  signed: 'bg-blue-100 text-blue-800',
  won: 'bg-emerald-100 text-emerald-800',
};

const RevenueTracker = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [leads, setLeads] = useState<LeadOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  // Filters
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form state
  const [form, setForm] = useState({
    lead_id: '',
    lead_name: '',
    agent_id: '',
    sale_price: '',
    commission_percentage: '',
    commission_amount: '',
    lead_source: '',
    pipeline_type: 'purchase',
    deal_date: new Date().toISOString().split('T')[0],
    currency: 'EUR',
    notes: '',
    status: 'deposit',
  });

  const fetchData = async () => {
    setLoading(true);
    const [dealsRes, membersRes, leadsRes] = await Promise.all([
      supabase.from('deals').select('*').order('deal_date', { ascending: false }),
      supabase.from('team_members').select('id, name').order('name'),
      supabase.from('leads').select('id, name, source, pipeline_type, status').in('status', ['Deposit', 'Signed', 'Gagné', 'Won']).order('name'),
    ]);

    if (dealsRes.data) setDeals(dealsRes.data as Deal[]);
    if (membersRes.data) setTeamMembers(membersRes.data);
    if (leadsRes.data) setLeads(leadsRes.data as LeadOption[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Auto-calc commission
  useEffect(() => {
    const price = parseFloat(form.sale_price) || 0;
    const pct = parseFloat(form.commission_percentage) || 0;
    setForm(f => ({ ...f, commission_amount: (price * pct / 100).toFixed(2) }));
  }, [form.sale_price, form.commission_percentage]);

  // When selecting a lead, auto-fill name/source/pipeline
  const handleLeadSelect = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      setForm(f => ({
        ...f,
        lead_id: leadId,
        lead_name: lead.name || '',
        lead_source: lead.source || '',
        pipeline_type: lead.pipeline_type || 'purchase',
      }));
    }
  };

  const resetForm = () => {
    setForm({
      lead_id: '', lead_name: '', agent_id: '', sale_price: '', commission_percentage: '',
      commission_amount: '', lead_source: '', pipeline_type: 'purchase',
      deal_date: new Date().toISOString().split('T')[0], currency: 'EUR', notes: '', status: 'deposit',
    });
    setEditingDeal(null);
  };

  const handleSubmit = async () => {
    if (!form.lead_name || !form.sale_price) {
      toast.error('Veuillez remplir le nom du lead et le prix de vente');
      return;
    }

    const payload = {
      lead_id: form.lead_id || null,
      lead_name: form.lead_name,
      agent_id: form.agent_id || null,
      sale_price: parseFloat(form.sale_price) || 0,
      commission_percentage: parseFloat(form.commission_percentage) || 0,
      commission_amount: parseFloat(form.commission_amount) || 0,
      lead_source: form.lead_source || null,
      pipeline_type: form.pipeline_type,
      deal_date: form.deal_date,
      currency: form.currency,
      notes: form.notes || null,
      status: form.status,
    };

    let error;
    if (editingDeal) {
      ({ error } = await supabase.from('deals').update(payload).eq('id', editingDeal.id));
    } else {
      ({ error } = await supabase.from('deals').insert(payload));
    }

    if (error) {
      toast.error('Erreur : ' + error.message);
    } else {
      toast.success(editingDeal ? 'Deal mis à jour' : 'Deal ajouté');
      resetForm();
      setDialogOpen(false);
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce deal ?')) return;
    const { error } = await supabase.from('deals').delete().eq('id', id);
    if (error) toast.error('Erreur : ' + error.message);
    else { toast.success('Deal supprimé'); fetchData(); }
  };

  const handleEdit = (deal: Deal) => {
    setEditingDeal(deal);
    setForm({
      lead_id: deal.lead_id || '',
      lead_name: deal.lead_name,
      agent_id: deal.agent_id || '',
      sale_price: String(deal.sale_price),
      commission_percentage: String(deal.commission_percentage),
      commission_amount: String(deal.commission_amount),
      lead_source: deal.lead_source || '',
      pipeline_type: deal.pipeline_type || 'purchase',
      deal_date: deal.deal_date,
      currency: deal.currency,
      notes: deal.notes || '',
      status: deal.status,
    });
    setDialogOpen(true);
  };

  // Filtered deals
  const filteredDeals = useMemo(() => {
    return deals.filter(d => {
      if (filterAgent !== 'all' && d.agent_id !== filterAgent) return false;
      if (filterSource !== 'all' && d.lead_source !== filterSource) return false;
      if (filterStatus !== 'all' && d.status !== filterStatus) return false;
      return true;
    });
  }, [deals, filterAgent, filterSource, filterStatus]);

  // Stats
  const totalCA = filteredDeals.reduce((s, d) => s + (d.sale_price || 0), 0);
  const totalCommission = filteredDeals.reduce((s, d) => s + (d.commission_amount || 0), 0);
  const avgCommPct = filteredDeals.length > 0
    ? filteredDeals.reduce((s, d) => s + (d.commission_percentage || 0), 0) / filteredDeals.length
    : 0;

  const sources = [...new Set(deals.map(d => d.lead_source).filter(Boolean))];
  const agentName = (id: string | null) => teamMembers.find(m => m.id === id)?.name || '—';

  const exportCSV = () => {
    const header = 'Lead,Agent,Prix de vente,% Commission,Montant commission,Source,Date,Statut\n';
    const rows = filteredDeals.map(d =>
      `"${d.lead_name}","${agentName(d.agent_id)}",${d.sale_price},${d.commission_percentage},${d.commission_amount},"${d.lead_source || ''}",${d.deal_date},"${STATUS_LABELS[d.status] || d.status}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `deals_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-background border rounded-lg p-4 space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><DollarSign className="h-4 w-4" /> CA Total</div>
          <p className="text-2xl font-bold">{fmt(totalCA)}</p>
        </div>
        <div className="bg-background border rounded-lg p-4 space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><TrendingUp className="h-4 w-4" /> Total Commissions</div>
          <p className="text-2xl font-bold">{fmt(totalCommission)}</p>
        </div>
        <div className="bg-background border rounded-lg p-4 space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Percent className="h-4 w-4" /> Commission Moy.</div>
          <p className="text-2xl font-bold">{avgCommPct.toFixed(1)}%</p>
        </div>
        <div className="bg-background border rounded-lg p-4 space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Hash className="h-4 w-4" /> Nombre de deals</div>
          <p className="text-2xl font-bold">{filteredDeals.length}</p>
        </div>
      </div>

      {/* Actions bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Ajouter un deal</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingDeal ? 'Modifier le deal' : 'Nouveau deal'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div>
                <Label className="text-xs">Lead existant (optionnel)</Label>
                <Select value={form.lead_id} onValueChange={handleLeadSelect}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner un lead..." /></SelectTrigger>
                  <SelectContent>
                    {leads.map(l => (
                      <SelectItem key={l.id} value={l.id}>{l.name} ({l.status})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Nom du lead *</Label>
                <Input value={form.lead_name} onChange={e => setForm(f => ({ ...f, lead_name: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Agent</Label>
                <Select value={form.agent_id} onValueChange={v => setForm(f => ({ ...f, agent_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                  <SelectContent>
                    {teamMembers.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Prix de vente (€) *</Label>
                  <Input type="number" value={form.sale_price} onChange={e => setForm(f => ({ ...f, sale_price: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">% Commission</Label>
                  <Input type="number" step="0.1" value={form.commission_percentage} onChange={e => setForm(f => ({ ...f, commission_percentage: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label className="text-xs">Montant commission (auto-calculé)</Label>
                <Input type="number" value={form.commission_amount} readOnly className="bg-muted" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Source</Label>
                  <Input value={form.lead_source} onChange={e => setForm(f => ({ ...f, lead_source: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Date du deal</Label>
                  <Input type="date" value={form.deal_date} onChange={e => setForm(f => ({ ...f, deal_date: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Pipeline</Label>
                  <Select value={form.pipeline_type} onValueChange={v => setForm(f => ({ ...f, pipeline_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="purchase">Achat</SelectItem>
                      <SelectItem value="rental">Location</SelectItem>
                      <SelectItem value="owners">Propriétaires</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Statut</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deposit">Dépôt reçu</SelectItem>
                      <SelectItem value="signed">Signé</SelectItem>
                      <SelectItem value="won">Gagné</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Notes</Label>
                <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
              </div>
              <Button onClick={handleSubmit}>{editingDeal ? 'Mettre à jour' : 'Ajouter'}</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1"><Download className="h-4 w-4" /> Export CSV</Button>

        {/* Filters */}
        <Select value={filterAgent} onValueChange={setFilterAgent}>
          <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="Agent" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les agents</SelectItem>
            {teamMembers.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
          </SelectContent>
        </Select>
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
        <p className="text-sm text-muted-foreground py-8 text-center">Aucun deal enregistré. Cliquez sur "Ajouter un deal" pour commencer.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead className="text-right">Prix de vente</TableHead>
              <TableHead className="text-right">%</TableHead>
              <TableHead className="text-right">Commission</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDeals.map(deal => (
              <TableRow key={deal.id}>
                <TableCell className="font-medium text-sm">{deal.lead_name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{agentName(deal.agent_id)}</TableCell>
                <TableCell className="text-right text-sm font-medium">{fmt(deal.sale_price)}</TableCell>
                <TableCell className="text-right text-xs">{deal.commission_percentage}%</TableCell>
                <TableCell className="text-right text-sm font-semibold text-emerald-700">{fmt(deal.commission_amount)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{deal.lead_source || '—'}</TableCell>
                <TableCell className="text-xs">{format(new Date(deal.deal_date), 'dd MMM yyyy', { locale: fr })}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[deal.status] || 'bg-muted'}`}>
                    {STATUS_LABELS[deal.status] || deal.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(deal)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(deal.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2} className="font-bold">Total ({filteredDeals.length} deals)</TableCell>
              <TableCell className="text-right font-bold">{fmt(totalCA)}</TableCell>
              <TableCell className="text-right text-xs">{avgCommPct.toFixed(1)}%</TableCell>
              <TableCell className="text-right font-bold text-emerald-700">{fmt(totalCommission)}</TableCell>
              <TableCell colSpan={4}></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )}
    </div>
  );
};

export default RevenueTracker;
