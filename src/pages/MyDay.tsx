import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { isPast, isToday, format, addDays, isBefore, isAfter, startOfDay, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertTriangle, Clock, CheckCircle2, Tag, UserX, User, Bell, CalendarDays, Users, Briefcase, Crown, Trophy, Home, ShoppingCart, Key } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import LoadingScreen from '@/components/layout/LoadingScreen';
import { GUARANTEED_TEAM_MEMBERS } from '@/services/teamMemberService';
import { toast } from '@/hooks/use-toast';
import StatCard from '@/components/myday/StatCard';
import ActionRow, { ActionItem } from '@/components/myday/ActionRow';
import LeadRow, { AlertLead } from '@/components/myday/LeadRow';

const MyDay = () => {
  const { user, isCommercial, isAdmin, userName } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  const [overdueActions, setOverdueActions] = useState<ActionItem[]>([]);
  const [todayActions, setTodayActions] = useState<ActionItem[]>([]);
  const [upcomingActions, setUpcomingActions] = useState<ActionItem[]>([]);
  const [untaggedLeads, setUntaggedLeads] = useState<AlertLead[]>([]);
  const [inactiveLeads, setInactiveLeads] = useState<AlertLead[]>([]);
  const [noActionLeads, setNoActionLeads] = useState<AlertLead[]>([]);
  const [newLeads, setNewLeads] = useState<AlertLead[]>([]);
  const [unassignedLeads, setUnassignedLeads] = useState<AlertLead[]>([]);
  const [vipLeads, setVipLeads] = useState<AlertLead[]>([]);
  
  const [totalActiveLeads, setTotalActiveLeads] = useState(0);
  const [monthlyWins, setMonthlyWins] = useState(0);
  const [pipelineCounts, setPipelineCounts] = useState({ purchase: 0, rental: 0, owner: 0, other: 0 });
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [completingActionId, setCompletingActionId] = useState<string | null>(null);

  const allMembers = useMemo(() => 
    [...GUARANTEED_TEAM_MEMBERS].sort((a, b) => a.name.localeCompare(b.name)), 
  []);

  const selectedAgentName = selectedAgentId 
    ? allMembers.find(m => m.id === selectedAgentId)?.name || null 
    : null;

  const handleCompleteAction = useCallback(async (action: ActionItem) => {
    setCompletingActionId(action.id);
    try {
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('action_history')
        .eq('id', action.leadId)
        .single();

      if (leadError || !lead) throw leadError;

      const history = Array.isArray(lead.action_history) ? lead.action_history : [];
      const updated = history.map((a: any) => 
        a.id === action.id ? { ...a, completedDate: new Date().toISOString() } : a
      );

      const { error } = await supabase
        .from('leads')
        .update({ action_history: updated })
        .eq('id', action.leadId);

      if (error) throw error;

      setOverdueActions(prev => prev.filter(a => a.id !== action.id));
      setTodayActions(prev => prev.filter(a => a.id !== action.id));
      setUpcomingActions(prev => prev.filter(a => a.id !== action.id));

      toast({ title: "Action complétée ✓", description: `${action.actionType} pour ${action.leadName}` });
    } catch (err) {
      console.error('Error completing action:', err);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de compléter l'action." });
    } finally {
      setCompletingActionId(null);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user, selectedAgentId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let teamMemberId: string | null = null;
      if (isCommercial) {
        const { data: tm } = await supabase
          .from('team_members')
          .select('id')
          .eq('email', user!.email)
          .single();
        teamMemberId = tm?.id || null;
      }

      let query = supabase
        .from('leads')
        .select('id, name, action_history, tags, status, created_at, assigned_to, budget, pipeline_type') as any;
      
      query = query.not('status', 'in', '("Gagné","Perdu")');
      query = query.is('deleted_at', null);

      if (isAdmin && selectedAgentId) {
        query = query.eq('assigned_to', selectedAgentId);
      } else if (teamMemberId) {
        query = query.eq('assigned_to', teamMemberId);
      }

      // Parallel: fetch wins for admin
      const winsPromise = isAdmin ? (async () => {
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
        let wQuery = supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'Gagné')
          .is('deleted_at', null)
          .gte('updated_at', thirtyDaysAgo) as any;
        if (selectedAgentId) wQuery = wQuery.eq('assigned_to', selectedAgentId);
        return wQuery;
      })() : Promise.resolve(null);

      const [{ data: leads }, winsResult] = await Promise.all([query, winsPromise]);
      
      if (winsResult) {
        setMonthlyWins(winsResult.count || 0);
      }

      if (!leads) return;

      const overdue: ActionItem[] = [];
      const today: ActionItem[] = [];
      const upcoming: ActionItem[] = [];
      const untagged: AlertLead[] = [];
      const inactive: AlertLead[] = [];
      const noAction: AlertLead[] = [];
      const newL: AlertLead[] = [];
      const unassigned: AlertLead[] = [];
      const vip: AlertLead[] = [];
      
      const pipelines = { purchase: 0, rental: 0, owner: 0, other: 0 };

      const now = new Date();
      const fiveDaysAgo = new Date(now);
      fiveDaysAgo.setDate(now.getDate() - 5);
      
      const tomorrow = startOfDay(addDays(now, 1));
      const sevenDaysLater = startOfDay(addDays(now, 8));

      setTotalActiveLeads(leads.length);

      leads.forEach((lead: any) => {
        // Pipeline counts
        const pt = (lead.pipeline_type || '').toLowerCase();
        if (pt.includes('purchase') || pt.includes('achat')) pipelines.purchase++;
        else if (pt.includes('rental') || pt.includes('location')) pipelines.rental++;
        else if (pt.includes('owner') || pt.includes('propriétaire') || pt.includes('proprietaire')) pipelines.owner++;
        else pipelines.other++;

        // VIP / Hot leads
        const tags: string[] = Array.isArray(lead.tags) ? lead.tags : [];
        const isVipOrHot = tags.some(t => ['Vip', 'Hot'].includes(t));
        const highBudget = lead.budget && lead.budget >= 1000000;
        if (isVipOrHot || highBudget) {
          const budgetStr = lead.budget ? `${(lead.budget / 1000000).toFixed(1)}M€` : '';
          const tagStr = tags.filter(t => ['Vip', 'Hot'].includes(t)).join(', ');
          vip.push({
            id: lead.id,
            name: lead.name || 'Sans nom',
            reason: [tagStr, budgetStr].filter(Boolean).join(' · ')
          });
        }


        // New leads
        if (lead.status === 'New') {
          newL.push({ id: lead.id, name: lead.name || 'Sans nom', reason: `Créé le ${format(new Date(lead.created_at), 'dd/MM', { locale: fr })}` });
        }

        // Unassigned leads (admin)
        if (!lead.assigned_to) {
          unassigned.push({ id: lead.id, name: lead.name || 'Sans nom', reason: `Créé le ${format(new Date(lead.created_at), 'dd/MM', { locale: fr })}` });
        }

        const actions = Array.isArray(lead.action_history) ? lead.action_history : [];
        const incompleteActions = actions.filter((a: any) => !a.completedDate && a.scheduledDate);
        
        let hasFutureAction = false;
        
        incompleteActions.forEach((action: any) => {
          const d = new Date(action.scheduledDate);
          if (isPast(d) && !isToday(d)) {
            overdue.push({
              id: action.id, leadId: lead.id, leadName: lead.name || 'Sans nom',
              actionType: action.actionType || 'Action', scheduledDate: action.scheduledDate, status: 'overdue'
            });
          } else if (isToday(d)) {
            today.push({
              id: action.id, leadId: lead.id, leadName: lead.name || 'Sans nom',
              actionType: action.actionType || 'Action', scheduledDate: action.scheduledDate, status: 'today'
            });
            hasFutureAction = true;
          } else {
            hasFutureAction = true;
            if (isAfter(d, tomorrow) && isBefore(d, sevenDaysLater)) {
              upcoming.push({
                id: action.id, leadId: lead.id, leadName: lead.name || 'Sans nom',
                actionType: action.actionType || 'Action', scheduledDate: action.scheduledDate, status: 'upcoming',
                dayLabel: format(d, 'EEEE dd', { locale: fr })
              });
            }
          }
        });

        if (!hasFutureAction && incompleteActions.length === 0) {
          noAction.push({ id: lead.id, name: lead.name || 'Sans nom', reason: 'Aucune action programmée' });
        }

        if (!tags.length) {
          untagged.push({ id: lead.id, name: lead.name || 'Sans nom', reason: 'Aucun tag' });
        }

        let lastActivity = new Date(lead.created_at);
        actions.forEach((a: any) => {
          if (a.completedDate) { const d = new Date(a.completedDate); if (d > lastActivity) lastActivity = d; }
          if (a.createdAt) { const d = new Date(a.createdAt); if (d > lastActivity) lastActivity = d; }
        });

        if (lastActivity < fiveDaysAgo) {
          inactive.push({ id: lead.id, name: lead.name || 'Sans nom', reason: `Dernière activité: ${format(lastActivity, 'dd/MM', { locale: fr })}` });
        }
      });

      upcoming.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

      setOverdueActions(overdue);
      setTodayActions(today);
      setUpcomingActions(upcoming);
      setUntaggedLeads(untagged);
      setInactiveLeads(inactive.slice(0, 10));
      setNoActionLeads(noAction.slice(0, 10));
      setNewLeads(newL);
      setUnassignedLeads(unassigned);
      setVipLeads(vip);
      
      setPipelineCounts(pipelines);
    } catch (error) {
      console.error('Error fetching my day data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }, []);

  if (isLoading) return (
    <>
      <Navbar />
      <SubNavigation />
      <LoadingScreen fullscreen={false} />
    </>
  );

  return (
    <>
      <Navbar />
      <SubNavigation />
      <div className={`${isMobile ? 'p-3' : 'p-6'} bg-background min-h-screen max-w-screen-xl mx-auto`}>
        <div className="mb-6">
          <h1 className="text-2xl font-futura text-foreground">
            {greeting}, {selectedAgentName || userName || 'Agent'} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
          </p>
        </div>

        {isAdmin && (
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <User className="h-4 w-4" /> Filtrer par agent
            </h4>
            <div className="flex flex-wrap gap-1">
              <Button variant={selectedAgentId === null ? "default" : "outline"} size="sm" className="text-xs px-2 py-1 h-auto" onClick={() => setSelectedAgentId(null)}>Tous</Button>
              {allMembers.map(member => (
                <Button key={member.id} variant={selectedAgentId === member.id ? "default" : "outline"} size="sm" className="text-xs px-2 py-1 h-auto" onClick={() => setSelectedAgentId(member.id)}>{member.name}</Button>
              ))}
            </div>
          </div>
        )}

        {/* Stats summary */}
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4 lg:grid-cols-8'} gap-3 mb-3`}>
          <StatCard icon={<Briefcase className="h-4 w-4 text-primary" />} label="Portfolio" count={totalActiveLeads} />
          <StatCard icon={<Crown className="h-4 w-4 text-amber-500" />} label="VIP / Hot" count={vipLeads.length} />
          <StatCard icon={<Bell className="h-4 w-4 text-destructive" />} label="Nouveaux" count={newLeads.length} />
          <StatCard icon={<AlertTriangle className="h-4 w-4 text-destructive" />} label="En retard" count={overdueActions.length} />
          <StatCard icon={<Clock className="h-4 w-4 text-blue-600" />} label="Aujourd'hui" count={todayActions.length} />
          <StatCard icon={<CalendarDays className="h-4 w-4 text-indigo-600" />} label="Cette semaine" count={upcomingActions.length} />
          <StatCard icon={<Mail className="h-4 w-4 text-rose-600" />} label="Sans email" count={noEmailLeads.length} />
          {isAdmin && <StatCard icon={<Trophy className="h-4 w-4 text-green-600" />} label="Gagnés (30j)" count={monthlyWins} />}
        </div>

        {/* Pipeline distribution */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="outline" className="text-xs gap-1"><ShoppingCart className="h-3 w-3" /> Achat: {pipelineCounts.purchase}</Badge>
          <Badge variant="outline" className="text-xs gap-1"><Key className="h-3 w-3" /> Location: {pipelineCounts.rental}</Badge>
          <Badge variant="outline" className="text-xs gap-1"><Home className="h-3 w-3" /> Propriétaires: {pipelineCounts.owner}</Badge>
          {pipelineCounts.other > 0 && <Badge variant="outline" className="text-xs gap-1">Autre: {pipelineCounts.other}</Badge>}
        </div>

        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'} gap-4`}>
          {/* VIP / Hot leads */}
          {vipLeads.length > 0 && (
            <Card className="border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-500" />
                  Leads prioritaires ({vipLeads.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {vipLeads.slice(0, 8).map(l => (
                  <LeadRow key={l.id} lead={l} onClick={() => navigate(`/leads/${l.id}`)} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* New leads */}
          <Card className="border-destructive/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-destructive" />
                Nouveaux leads ({newLeads.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {newLeads.length === 0 ? (
                <p className="text-sm text-muted-foreground flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-500" /> Aucun nouveau lead</p>
              ) : newLeads.slice(0, 8).map(l => (
                <LeadRow key={l.id} lead={l} onClick={() => navigate(`/leads/${l.id}?tab=actions`)} />
              ))}
            </CardContent>
          </Card>

          {/* Overdue actions */}
          <Card className="border-destructive/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Actions en retard ({overdueActions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {overdueActions.length === 0 ? (
                <p className="text-sm text-muted-foreground flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-500" /> Tout est à jour !</p>
              ) : overdueActions.slice(0, 8).map(a => (
                <ActionRow key={a.id} action={a} onClick={() => navigate(`/leads/${a.leadId}`)} onComplete={handleCompleteAction} completing={completingActionId === a.id} />
              ))}
            </CardContent>
          </Card>

          {/* Today's actions */}
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                Actions du jour ({todayActions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {todayActions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Rien de prévu aujourd'hui</p>
              ) : todayActions.slice(0, 8).map(a => (
                <ActionRow key={a.id} action={a} onClick={() => navigate(`/leads/${a.leadId}`)} onComplete={handleCompleteAction} completing={completingActionId === a.id} />
              ))}
            </CardContent>
          </Card>

          {/* Upcoming 7 days */}
          <Card className="border-indigo-200 dark:border-indigo-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-indigo-600" />
                Cette semaine ({upcomingActions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {upcomingActions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune action prévue cette semaine</p>
              ) : upcomingActions.slice(0, 10).map(a => (
                <ActionRow key={a.id} action={a} onClick={() => navigate(`/leads/${a.leadId}`)} onComplete={handleCompleteAction} completing={completingActionId === a.id} />
              ))}
            </CardContent>
          </Card>

          {/* No email sent */}
          <Card className="border-rose-200 dark:border-rose-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4 text-rose-600" />
                Sans email envoyé ({noEmailLeads.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {noEmailLeads.length === 0 ? (
                <p className="text-sm text-muted-foreground flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-500" /> Tous les leads ont été contactés</p>
              ) : noEmailLeads.map(l => (
                <LeadRow key={l.id} lead={l} onClick={() => navigate(`/leads/${l.id}`)} />
              ))}
            </CardContent>
          </Card>

          {/* Unassigned leads (admin only) */}
          {isAdmin && (
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  Leads non assignés ({unassignedLeads.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {unassignedLeads.length === 0 ? (
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-500" /> Tous les leads sont assignés</p>
                ) : unassignedLeads.slice(0, 8).map(l => (
                  <LeadRow key={l.id} lead={l} onClick={() => navigate(`/leads/${l.id}`)} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Leads without scheduled action */}
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <UserX className="h-4 w-4 text-orange-600" />
                Sans action programmée ({noActionLeads.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {noActionLeads.length === 0 ? (
                <p className="text-sm text-muted-foreground flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-500" /> Tous les leads ont des actions</p>
              ) : noActionLeads.map(l => (
                <LeadRow key={l.id} lead={l} onClick={() => navigate(`/leads/${l.id}`)} />
              ))}
            </CardContent>
          </Card>

          {/* Inactive leads */}
          <Card className="border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4 text-amber-600" />
                Inactifs +5 jours ({inactiveLeads.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {inactiveLeads.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tous les leads sont actifs</p>
              ) : inactiveLeads.map(l => (
                <LeadRow key={l.id} lead={l} onClick={() => navigate(`/leads/${l.id}`)} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default MyDay;
