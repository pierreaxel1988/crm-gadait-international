import React, { useState, useEffect } from 'react';
import { Calendar, Download, TrendingUp, Users, MessageCircle, Mail, Target, Clock, UserCheck } from 'lucide-react';
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
}

interface StatusDistribution {
  status: string;
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
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSalesAnalytics = async () => {
    setLoading(true);
    try {
      // Récupérer les commerciaux
      const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select('*')
        .eq('role', 'commercial');

      if (teamError) throw teamError;

      // Récupérer les données pour chaque commercial
      const salesPersonsData = await Promise.all(
        (teamMembers || []).map(async (member) => {
          // Leads assignés
          const { data: leads, error: leadsError } = await supabase
            .from('leads')
            .select('id, status, created_at')
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

          return {
            name: member.name,
            email: member.email,
            assigned_leads: totalLeads,
            conversion_rate: conversionRate,
            leads_by_status: leadsByStatus,
            total_connection_time: sessionStats.totalMinutes,
            avg_session_duration: sessionStats.avgSessionDuration,
            total_sessions: sessionStats.totalSessions,
            working_hours: workingHours
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
      console.error('Erreur lors du chargement des analytics commerciaux:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesAnalytics();
  }, [startDate, endDate]);

  const exportToCSV = () => {
    const csvContent = [
      ['Commercial', 'Email', 'Leads assignés', 'Temps connexion', 'Taux conversion (%)'],
      ...salesData.map(person => [
        person.name,
        person.email,
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

  const totalLeads = salesData.reduce((sum, person) => sum + person.assigned_leads, 0);
  const totalConnectionTime = salesData.reduce((sum, person) => sum + person.total_connection_time, 0);
  const avgConversionRate = salesData.length > 0 
    ? Math.round(salesData.reduce((sum, person) => sum + person.conversion_rate, 0) / salesData.length)
    : 0;

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

      {/* Métriques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              Performance par commercial
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

        {/* Activité sur 7 jours */}
        <Card>
          <CardHeader>
            <CardTitle className="font-normal">Temps de connexion des 7 derniers jours</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="leads_created" 
                  stroke={COLORS[0]} 
                  name="Leads créés"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
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
                  <th className="text-right p-2">Sessions</th>
                  <th className="text-right p-2">Heures travail</th>
                  <th className="text-right p-2">Taux conversion</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((person, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">
                      <div>
                        <div className="font-medium">{person.name}</div>
                        <div className="text-xs text-muted-foreground">{person.email}</div>
                      </div>
                    </td>
                    <td className="text-right p-2">{person.assigned_leads}</td>
                    <td className="text-right p-2">
                      <div className="text-sm font-medium">
                        {formatDuration(person.total_connection_time)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Moy: {formatDuration(person.avg_session_duration)}
                      </div>
                    </td>
                    <td className="text-right p-2">{person.total_sessions}</td>
                    <td className="text-right p-2">
                      <div className="text-xs">
                        {person.working_hours.start} - {person.working_hours.end}
                      </div>
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