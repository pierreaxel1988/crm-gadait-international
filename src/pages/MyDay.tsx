import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { isPast, isToday, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertTriangle, Clock, CheckCircle2, Tag, UserX, ArrowRight, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import LoadingScreen from '@/components/layout/LoadingScreen';
import { GUARANTEED_TEAM_MEMBERS } from '@/services/teamMemberService';

interface ActionItem {
  id: string;
  leadId: string;
  leadName: string;
  actionType: string;
  scheduledDate: string;
  status: 'overdue' | 'today' | 'upcoming';
}

interface AlertLead {
  id: string;
  name: string;
  reason: string;
}

const MyDay = () => {
  const { user, isCommercial, isAdmin, userName } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  const [overdueActions, setOverdueActions] = useState<ActionItem[]>([]);
  const [todayActions, setTodayActions] = useState<ActionItem[]>([]);
  const [untaggedLeads, setUntaggedLeads] = useState<AlertLead[]>([]);
  const [inactiveLeads, setInactiveLeads] = useState<AlertLead[]>([]);
  const [noActionLeads, setNoActionLeads] = useState<AlertLead[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const allMembers = useMemo(() => 
    [...GUARANTEED_TEAM_MEMBERS].sort((a, b) => a.name.localeCompare(b.name)), 
  []);

  const selectedAgentName = selectedAgentId 
    ? allMembers.find(m => m.id === selectedAgentId)?.name || null 
    : null;

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user, selectedAgentId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Get current team member ID
      let teamMemberId: string | null = null;
      if (isCommercial) {
        const { data: tm } = await supabase
          .from('team_members')
          .select('id')
          .eq('email', user!.email)
          .single();
        teamMemberId = tm?.id || null;
      }

      // Fetch leads
      let query = supabase
        .from('leads')
        .select('id, name, action_history, tags, status, created_at') as any;
      
      query = query.not('status', 'in', '("Gagné","Perdu")');

      if (teamMemberId) {
        query = query.eq('assigned_to', teamMemberId);
      }

      const { data: leads } = await query;
      if (!leads) return;

      const overdue: ActionItem[] = [];
      const today: ActionItem[] = [];
      const untagged: AlertLead[] = [];
      const inactive: AlertLead[] = [];
      const noAction: AlertLead[] = [];

      const now = new Date();
      const fiveDaysAgo = new Date(now);
      fiveDaysAgo.setDate(now.getDate() - 5);

      leads.forEach(lead => {
        // Check actions
        const actions = Array.isArray(lead.action_history) ? lead.action_history : [];
        const incompleteActions = actions.filter((a: any) => !a.completedDate && a.scheduledDate);
        
        let hasFutureAction = false;
        
        incompleteActions.forEach((action: any) => {
          const d = new Date(action.scheduledDate);
          if (isPast(d) && !isToday(d)) {
            overdue.push({
              id: action.id,
              leadId: lead.id,
              leadName: lead.name || 'Sans nom',
              actionType: action.actionType || 'Action',
              scheduledDate: action.scheduledDate,
              status: 'overdue'
            });
          } else if (isToday(d)) {
            today.push({
              id: action.id,
              leadId: lead.id,
              leadName: lead.name || 'Sans nom',
              actionType: action.actionType || 'Action',
              scheduledDate: action.scheduledDate,
              status: 'today'
            });
            hasFutureAction = true;
          } else {
            hasFutureAction = true;
          }
        });

        // No future action scheduled
        if (!hasFutureAction && incompleteActions.length === 0) {
          noAction.push({ id: lead.id, name: lead.name || 'Sans nom', reason: 'Aucune action programmée' });
        }

        // Untagged leads
        if (!lead.tags || lead.tags.length === 0) {
          untagged.push({ id: lead.id, name: lead.name || 'Sans nom', reason: 'Aucun tag' });
        }

        // Inactive leads (no update in 5+ days)
        const lastUpdate = new Date(lead.created_at);
        if (lastUpdate < fiveDaysAgo) {
          inactive.push({ id: lead.id, name: lead.name || 'Sans nom', reason: `Dernière activité: ${format(lastUpdate, 'dd/MM', { locale: fr })}` });
        }
      });

      setOverdueActions(overdue);
      setTodayActions(today);
      setUntaggedLeads(untagged);
      setInactiveLeads(inactive.slice(0, 10));
      setNoActionLeads(noAction.slice(0, 10));
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
            {greeting}, {userName || 'Agent'} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
          </p>
        </div>

        {/* Stats summary */}
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-3 mb-6`}>
          <StatCard icon={<AlertTriangle className="h-4 w-4 text-destructive" />} label="En retard" count={overdueActions.length} variant="destructive" />
          <StatCard icon={<Clock className="h-4 w-4 text-blue-600" />} label="Aujourd'hui" count={todayActions.length} variant="blue" />
          <StatCard icon={<Tag className="h-4 w-4 text-amber-600" />} label="Sans tag" count={untaggedLeads.length} variant="amber" />
          <StatCard icon={<UserX className="h-4 w-4 text-orange-600" />} label="Sans action" count={noActionLeads.length} variant="orange" />
        </div>

        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
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
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Tout est à jour !
                </p>
              ) : (
                overdueActions.slice(0, 8).map(a => (
                  <ActionRow key={a.id} action={a} onClick={() => navigate(`/leads/${a.leadId}`)} />
                ))
              )}
            </CardContent>
          </Card>

          {/* Today's actions */}
          <Card className="border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                Actions du jour ({todayActions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {todayActions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Rien de prévu aujourd'hui</p>
              ) : (
                todayActions.slice(0, 8).map(a => (
                  <ActionRow key={a.id} action={a} onClick={() => navigate(`/leads/${a.leadId}`)} />
                ))
              )}
            </CardContent>
          </Card>

          {/* Leads without scheduled action */}
          <Card className="border-orange-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <UserX className="h-4 w-4 text-orange-600" />
                Leads sans action programmée ({noActionLeads.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {noActionLeads.length === 0 ? (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Tous les leads ont des actions
                </p>
              ) : (
                noActionLeads.map(l => (
                  <LeadRow key={l.id} lead={l} onClick={() => navigate(`/leads/${l.id}`)} />
                ))
              )}
            </CardContent>
          </Card>

          {/* Inactive leads */}
          <Card className="border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4 text-amber-600" />
                Leads inactifs +5 jours ({inactiveLeads.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {inactiveLeads.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tous les leads sont actifs</p>
              ) : (
                inactiveLeads.map(l => (
                  <LeadRow key={l.id} lead={l} onClick={() => navigate(`/leads/${l.id}`)} />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

const StatCard = ({ icon, label, count, variant }: { icon: React.ReactNode; label: string; count: number; variant: string }) => (
  <Card className="p-3">
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <p className="text-2xl font-semibold text-foreground">{count}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  </Card>
);

const ActionRow = ({ action, onClick }: { action: ActionItem; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-muted/50 transition-colors text-left"
  >
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground truncate">{action.leadName}</p>
      <p className="text-xs text-muted-foreground">{action.actionType}</p>
    </div>
    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 ml-2" />
  </button>
);

const LeadRow = ({ lead, onClick }: { lead: AlertLead; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-muted/50 transition-colors text-left"
  >
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
      <p className="text-xs text-muted-foreground">{lead.reason}</p>
    </div>
    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 ml-2" />
  </button>
);

export default MyDay;
