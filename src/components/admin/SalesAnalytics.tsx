import React, { useState, useEffect } from 'react';
import { Calendar, Download, TrendingUp, Users, MessageCircle, Mail, Target, Clock, UserCheck, CheckCircle, AlertCircle, XCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { sessionTracker, formatDuration, getWorkingHours } from '@/services/sessionTracker';

interface SalesPersonData {
  name: string;
  email: string;
  assigned_leads: number;
  conversion_rate: number;
  leads_by_status: { [key: string]: number };
  // Métriques de session
  total_connection_time: number; // en minutes
  avg_session_duration: number; // en minutes
  total_sessions: number;
  working_hours: { start: string; end: string };
  // Métriques d'actions
  actions_to_do: number;
  actions_completed: number;
  actions_overdue: number;
  actions_by_type: { [key: string]: number };
}

interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

interface TagDistribution {
  tag: string;
  count: number;
  percentage: number;
}

interface ActivityData {
  date: string;
  emails: number;
  conversations: number;
  leads_created: number;
}

const COLORS = [
  '#8B7355', // Taupe
  '#A0956B', // Beige doré
  '#6B5B73', // Mauve grisé
  '#9B8579', // Café au lait
  '#7A8471', // Vert olive
  '#B5A288', // Sable
  '#8E7B68', // Châtaigne
  '#A69C8E', // Gris chaud
];

const STATUS_COLORS: { [key: string]: string } = {
  'Nouveau contact': '#8B7355',
  'Contact établi': '#A0956B',
  'Visite programmée': '#6B5B73',
  'Proposition envoyée': '#9B8579',
  'Négociation': '#7A8471',
  'Vendu': '#22c55e',
  'Perdu': '#ef4444',
  'En attente': '#f59e0b'
};

const SalesAnalytics = () => {
  const [startDate, setStartDate] = useState(format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [salesData, setSalesData] = useState<SalesPersonData[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);
  const [tagDistribution, setTagDistribution] = useState<TagDistribution[]>([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSalesperson, setSelectedSalesperson] = useState<string>('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fetchSalesAnalytics = async () => {
    setLoading(true);
    try {
      // Récupérer les agents et admins qui gèrent des leads
      const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select('*')
        .in('role', ['agent', 'admin']);

      if (teamError) {
        console.error('Erreur lors de la récupération des agents:', teamError);
        throw teamError;
      }

      console.log('Agents trouvés:', teamMembers);
      
      if (!teamMembers || teamMembers.length === 0) {
        console.warn('Aucun agent trouvé dans la base de données');
        setSalesData([]);
        setStatusDistribution([]);
        setActivityData([]);
        return;
      }

      // Récupérer les données pour chaque agent
      const salesPersonsData = await Promise.all(
        (teamMembers || []).map(async (member) => {
          // Leads assignés avec leur historique d'actions et leurs tags
          const { data: leads, error: leadsError } = await supabase
            .from('leads')
            .select('id, status, created_at, action_history, next_action_date, tags')
            .eq('assigned_to', member.id)
            .gte('created_at', startDate + 'T00:00:00')
            .lte('created_at', endDate + 'T23:59:59')
            .is('deleted_at', null);

          if (leadsError) throw leadsError;

          // Récupérer les statistiques de session pour ce commercial
          const sessionStats = await sessionTracker.getUserSessionStats(
            member.id,
            startDate + 'T00:00:00',
            endDate + 'T23:59:59'
          );

          // Calcul des statistiques par statut
          const leadsByStatus: { [key: string]: number } = {};
          leads?.forEach(lead => {
            const status = lead.status || 'Non défini';
            leadsByStatus[status] = (leadsByStatus[status] || 0) + 1;
          });

          // Calcul du taux de conversion (leads vendus / total)
          const soldLeads = leadsByStatus['Vendu'] || 0;
          const totalLeads = leads?.length || 0;
          const conversionRate = totalLeads > 0 ? Math.round((soldLeads / totalLeads) * 100) : 0;

          // Calculer les heures de travail
          const workingHours = getWorkingHours(sessionStats.sessions);

          // Calculer les métriques d'actions
          let actionsToDo = 0;
          let actionsCompleted = 0;
          let actionsOverdue = 0;
          const actionsByType: { [key: string]: number } = {};

          leads?.forEach(lead => {
            // Actions dans l'historique (complétées)
            if (lead.action_history && Array.isArray(lead.action_history)) {
              lead.action_history.forEach((action: any) => {
                // Vérifier si l'action est complétée (soit completedDate soit completed_at)
                if (action.completedDate || action.completed_at) {
                  actionsCompleted++;
                  const actionType = action.actionType || action.action_type || action.type || 'Autre';
                  actionsByType[actionType] = (actionsByType[actionType] || 0) + 1;
                } else {
                  // Si l'action n'est pas complétée, c'est une action à faire
                  actionsToDo++;
                  // Vérifier si elle est en retard en regardant scheduledDate
                  if (action.scheduledDate) {
                    const actionDate = new Date(action.scheduledDate);
                    const now = new Date();
                    if (actionDate < now) {
                      actionsOverdue++;
                    }
                  }
                }
              });
            }

            // Actions en cours basées sur next_action_date (pour les nouvelles actions)
            if (lead.next_action_date) {
              actionsToDo++;
              const actionDate = new Date(lead.next_action_date);
              const now = new Date();
              if (actionDate < now) {
                actionsOverdue++;
              }
            }
          });

          return {
            name: member.name,
            email: member.email,
            assigned_leads: totalLeads,
            conversion_rate: conversionRate,
            leads_by_status: leadsByStatus,
            total_connection_time: sessionStats.totalMinutes,
            avg_session_duration: sessionStats.avgSessionDuration,
            total_sessions: sessionStats.totalSessions,
            working_hours: workingHours,
            actions_to_do: actionsToDo,
            actions_completed: actionsCompleted,
            actions_overdue: actionsOverdue,
            actions_by_type: actionsByType
          };
        })
      );

      setSalesData(salesPersonsData);

      // Calculer la distribution globale des statuts
      const globalStatusCount: { [key: string]: number } = {};
      let totalGlobalLeads = 0;

      salesPersonsData.forEach(person => {
        Object.entries(person.leads_by_status).forEach(([status, count]) => {
          globalStatusCount[status] = (globalStatusCount[status] || 0) + count;
          totalGlobalLeads += count;
        });
      });

      const statusDistrib = Object.entries(globalStatusCount)
        .map(([status, count]) => ({
          status,
          count,
          percentage: Math.round((count / totalGlobalLeads) * 100)
        }))
        .sort((a, b) => b.count - a.count);

      setStatusDistribution(statusDistrib);

      // Calculer la distribution globale des tags
      const globalTagCount: { [key: string]: number } = {};
      let totalGlobalTags = 0;

      // Récupérer tous les leads pour calculer les tags
      const { data: allLeads } = await supabase
        .from('leads')
        .select('tags')
        .gte('created_at', startDate + 'T00:00:00')
        .lte('created_at', endDate + 'T23:59:59')
        .is('deleted_at', null);

      allLeads?.forEach(lead => {
        if (lead.tags && Array.isArray(lead.tags)) {
          lead.tags.forEach(tag => {
            if (tag && tag.trim()) {
              globalTagCount[tag] = (globalTagCount[tag] || 0) + 1;
              totalGlobalTags++;
            }
          });
        }
      });

      const tagDistrib = Object.entries(globalTagCount)
        .map(([tag, count]) => ({
          tag,
          count,
          percentage: totalGlobalTags > 0 ? Math.round((count / totalGlobalTags) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count);

      setTagDistribution(tagDistrib);

      // Activité quotidienne (derniers 7 jours)
      const dailyActivity = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        
        // Emails du jour
        const { data: dailyEmails } = await supabase
          .from('lead_emails')
          .select('id')
          .eq('is_sent', true)
          .gte('created_at', dateStr + 'T00:00:00')
          .lte('created_at', dateStr + 'T23:59:59');

        // Conversations du jour
        const { data: dailyConversations } = await supabase
          .from('lead_ai_conversations')
          .select('id')
          .gte('created_at', dateStr + 'T00:00:00')
          .lte('created_at', dateStr + 'T23:59:59');

        // Leads créés du jour
        const { data: dailyLeads } = await supabase
          .from('leads')
          .select('id')
          .gte('created_at', dateStr + 'T00:00:00')
          .lte('created_at', dateStr + 'T23:59:59')
          .is('deleted_at', null);

        dailyActivity.push({
          date: format(date, 'dd/MM', { locale: fr }),
          emails: dailyEmails?.length || 0,
          conversations: dailyConversations?.length || 0,
          leads_created: dailyLeads?.length || 0
        });
      }

      setActivityData(dailyActivity);

    } catch (error) {
      console.error('Erreur lors du chargement des analytics agents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesAnalytics();
  }, [startDate, endDate]);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.relative')) {
          setDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const exportToCSV = () => {
    const csvContent = [
      ['Agent', 'Leads assignés', 'Temps connexion', 'Taux conversion (%)'],
      ...salesData.map(person => [
        person.name,
        person.assigned_leads,
        formatDuration(person.total_connection_time),
        person.conversion_rate
      ])
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `activite-commerciaux-${startDate}-${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrer les données selon le commercial sélectionné
  const filteredData = selectedSalesperson === 'all' ? salesData : salesData.filter(person => person.email === selectedSalesperson);
  
  const totalLeads = filteredData.reduce((sum, person) => sum + person.assigned_leads, 0);
  const totalConnectionTime = filteredData.reduce((sum, person) => sum + person.total_connection_time, 0);
  const totalActionsToDo = filteredData.reduce((sum, person) => sum + person.actions_to_do, 0);
  const totalActionsCompleted = filteredData.reduce((sum, person) => sum + person.actions_completed, 0);
  const totalActionsOverdue = filteredData.reduce((sum, person) => sum + person.actions_overdue, 0);
  const avgConversionRate = filteredData.length > 0 
    ? Math.round(filteredData.reduce((sum, person) => sum + person.conversion_rate, 0) / filteredData.length)
    : 0;

  const selectedPersonName = selectedSalesperson === 'all' 
    ? 'Tous les agents' 
    : salesData.find(p => p.email === selectedSalesperson)?.name || 'Agent sélectionné';

  // Afficher un message si aucun commercial trouvé
  if (!loading && salesData.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-normal">
              <Calendar className="h-5 w-5" />
              Période d'analyse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="start-date">Date de début</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="end-date">Date de fin</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <Button onClick={fetchSalesAnalytics} disabled={loading}>
                {loading ? 'Chargement...' : 'Actualiser'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun agent trouvé</h3>
            <p className="text-muted-foreground mb-4">
              Il n'y a actuellement aucun agent avec le rôle "agent" dans votre équipe.
            </p>
            <p className="text-sm text-muted-foreground">
              Vous devez d'abord ajouter des agents dans la section "Gestion des utilisateurs" avec le rôle "agent".
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres de période */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-normal">
            <Calendar className="h-5 w-5" />
            Période d'analyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="start-date">Date de début</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="end-date">Date de fin</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button onClick={fetchSalesAnalytics} disabled={loading}>
              {loading ? 'Chargement...' : 'Actualiser'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sélecteur de commercial */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-normal">
            <Users className="h-5 w-5" />
            Agent sélectionné
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <span className="font-medium">{selectedPersonName}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                <div
                  onClick={() => {
                    setSelectedSalesperson('all');
                    setDropdownOpen(false);
                  }}
                  className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                    selectedSalesperson === 'all' ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                >
                  Tous les agents
                </div>
                {salesData.map((person) => (
                  <div
                    key={person.email}
                    onClick={() => {
                      setSelectedSalesperson(person.email);
                      setDropdownOpen(false);
                    }}
                    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                      selectedSalesperson === person.email ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    <div className="font-medium">{person.name}</div>
                    <div className="text-xs text-gray-500">{person.email}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Métriques pour le commercial sélectionné */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Leads totaux</p>
                <p className="text-2xl font-bold text-primary">{totalLeads}</p>
              </div>
              <Target className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Temps connexion total</p>
                <p className="text-2xl font-bold text-primary">{formatDuration(totalConnectionTime)}</p>
              </div>
              <Clock className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Actions à faire</p>
                <p className="text-2xl font-bold text-primary">{totalActionsToDo}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Actions réalisées</p>
                <p className="text-2xl font-bold text-green-600">{totalActionsCompleted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Actions en retard</p>
                <p className="text-2xl font-bold text-red-600">{totalActionsOverdue}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux conversion moy.</p>
                <p className="text-2xl font-bold text-primary">{avgConversionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance par commercial */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between font-normal">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Performance par agent
            </span>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="assigned_leads" name="Leads assignés" fill={COLORS[0]} />
              <Bar dataKey="total_connection_time" name="Temps connexion (min)" fill={COLORS[1]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution des statuts */}
        <Card>
          <CardHeader>
            <CardTitle className="font-normal">Distribution des leads par statut</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusDistribution.map((item, index) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: STATUS_COLORS[item.status] || COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium">{item.status}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{item.count}</div>
                    <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribution des tags */}
        <Card>
          <CardHeader>
            <CardTitle className="font-normal">Distribution des leads par tags</CardTitle>
          </CardHeader>
          <CardContent>
            {tagDistribution.length > 0 ? (
              <div className="space-y-4">
                {tagDistribution.slice(0, 10).map((item, index) => (
                  <div key={item.tag} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium">{item.tag}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{item.count}</div>
                      <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                    </div>
                  </div>
                ))}
                {tagDistribution.length > 10 && (
                  <div className="text-xs text-muted-foreground text-center pt-2">
                    ... et {tagDistribution.length - 10} autres tags
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucun tag trouvé sur cette période</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      </div>

      {/* Tableau détaillé */}
      <Card>
        <CardHeader>
          <CardTitle className="font-normal">Détail par commercial</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Commercial</th>
                  <th className="text-right p-2">Leads assignés</th>
                  <th className="text-right p-2">Temps connexion</th>
                  <th className="text-right p-2">Actions à faire</th>
                  <th className="text-right p-2">Actions réalisées</th>
                  <th className="text-right p-2">Actions retard</th>
                  <th className="text-right p-2">Taux conversion</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((person, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">
                      <div>
                        <div className="font-medium">{person.name}</div>
                        
                        <div className="text-xs text-muted-foreground">
                          {person.working_hours.start} - {person.working_hours.end}
                        </div>
                      </div>
                    </td>
                    <td className="text-right p-2">{person.assigned_leads}</td>
                    <td className="text-right p-2">
                      <div className="text-sm font-medium">
                        {formatDuration(person.total_connection_time)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {person.total_sessions} sessions
                      </div>
                    </td>
                    <td className="text-right p-2">
                      <span className="text-sm font-medium text-blue-600">
                        {person.actions_to_do}
                      </span>
                    </td>
                    <td className="text-right p-2">
                      <span className="text-sm font-medium text-green-600">
                        {person.actions_completed}
                      </span>
                    </td>
                    <td className="text-right p-2">
                      <span className={`text-sm font-medium ${
                        person.actions_overdue > 0 ? 'text-red-600' : 'text-gray-400'
                      }`}>
                        {person.actions_overdue}
                      </span>
                    </td>
                    <td className="text-right p-2">
                      <span className={`font-medium ${
                        person.conversion_rate >= 20 ? 'text-green-600' :
                        person.conversion_rate >= 10 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {person.conversion_rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesAnalytics;