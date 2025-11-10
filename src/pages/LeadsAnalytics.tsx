import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Eye, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface LeadAnalytics {
  leadId: string;
  leadName: string;
  leadEmail: string;
  leadStatus: string;
  assignedTo: string | null;
  totalClicks: number;
  lastClickDate: Date | null;
  mostViewedProperty: {
    title: string;
    clicks: number;
  } | null;
}

const LeadsAnalytics = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<LeadAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'clicks' | 'recent'>('clicks');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Récupérer tous les leads non supprimés
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select(`
          id,
          name,
          email,
          status,
          assigned_to,
          team_members:assigned_to (
            name
          )
        `)
        .is('deleted_at', null)
        .order('name');

      if (leadsError) throw leadsError;

      // Récupérer tous les clics de propriétés
      const { data: clicks, error: clicksError } = await supabase
        .from('property_clicks' as any)
        .select('lead_id, property_id, clicked_at')
        .order('clicked_at', { ascending: false });

      if (clicksError) throw clicksError;

      // Récupérer les détails des propriétés pour les clics
      const uniquePropertyIds = [...new Set((clicks || []).map((c: any) => c.property_id).filter(Boolean))];
      
      const { data: properties, error: propertiesError } = await supabase
        .from('gadait_properties')
        .select('id, title')
        .in('id', uniquePropertyIds);

      if (propertiesError) throw propertiesError;

      // Créer un map des propriétés pour un accès rapide
      const propertiesMap = (properties || []).reduce((acc, prop) => {
        acc[prop.id] = prop.title;
        return acc;
      }, {} as Record<string, string>);

      // Agréger les données
      const analyticsData: LeadAnalytics[] = (leads || []).map(lead => {
        const leadClicks = (clicks || []).filter((click: any) => click.lead_id === lead.id);
        const totalClicks = leadClicks.length;
        const lastClick = leadClicks.length > 0 ? new Date((leadClicks[0] as any).clicked_at) : null;

        // Calculer la propriété la plus consultée
        const propertyClickCounts = leadClicks.reduce((acc: Record<string, number>, click: any) => {
          if (click.property_id) {
            acc[click.property_id] = (acc[click.property_id] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        const mostViewedPropertyId = Object.entries(propertyClickCounts)
          .sort(([, a], [, b]) => b - a)[0]?.[0];

        const mostViewedProperty = mostViewedPropertyId
          ? {
              title: propertiesMap[mostViewedPropertyId] || 'Propriété inconnue',
              clicks: propertyClickCounts[mostViewedPropertyId]
            }
          : null;

        return {
          leadId: lead.id,
          leadName: lead.name,
          leadEmail: lead.email || 'N/A',
          leadStatus: lead.status,
          assignedTo: (lead.team_members as any)?.name || null,
          totalClicks,
          lastClickDate: lastClick,
          mostViewedProperty
        };
      });

      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Erreur lors de la récupération des analytics:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setIsLoading(false);
    }
  };

  const sortedAnalytics = [...analytics].sort((a, b) => {
    if (sortBy === 'clicks') {
      return b.totalClicks - a.totalClicks;
    } else {
      if (!a.lastClickDate) return 1;
      if (!b.lastClickDate) return -1;
      return b.lastClickDate.getTime() - a.lastClickDate.getTime();
    }
  });

  const formatDate = (date: Date | null) => {
    if (!date) return 'Jamais';
    try {
      return formatDistanceToNow(date, { addSuffix: true, locale: fr });
    } catch {
      return 'Date invalide';
    }
  };

  const getHeatLevel = (clicks: number) => {
    if (clicks === 0) return { label: 'Froid', variant: 'secondary' as const, color: 'bg-gray-500' };
    if (clicks < 5) return { label: 'Tiède', variant: 'outline' as const, color: 'bg-blue-500' };
    if (clicks < 10) return { label: 'Chaud', variant: 'default' as const, color: 'bg-orange-500' };
    return { label: 'Très chaud', variant: 'destructive' as const, color: 'bg-red-500' };
  };

  const totalLeads = analytics.length;
  const activeLeads = analytics.filter(a => a.totalClicks > 0).length;
  const avgClicks = analytics.length > 0 
    ? (analytics.reduce((sum, a) => sum + a.totalClicks, 0) / analytics.length).toFixed(1)
    : 0;
  const hotLeads = analytics.filter(a => a.totalClicks >= 10).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics des Leads</h1>
          <p className="text-muted-foreground">
            Analysez l'engagement de vos leads et priorisez les prospects chauds
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLeads}</div>
              <p className="text-xs text-muted-foreground">Leads actifs dans le CRM</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads Engagés</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeLeads}</div>
              <p className="text-xs text-muted-foreground">
                {totalLeads > 0 ? Math.round((activeLeads / totalLeads) * 100) : 0}% des leads
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clics Moyens</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgClicks}</div>
              <p className="text-xs text-muted-foreground">Clics par lead</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads Très Chauds</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hotLeads}</div>
              <p className="text-xs text-muted-foreground">10+ consultations</p>
            </CardContent>
          </Card>
        </div>

        {/* Sorting buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSortBy('clicks')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'clicks'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Trier par clics
          </button>
          <button
            onClick={() => setSortBy('recent')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'recent'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Trier par récence
          </button>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Détails par Lead</CardTitle>
            <CardDescription>
              Cliquez sur un lead pour voir ses détails complets
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Niveau</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-center">Clics</TableHead>
                      <TableHead>Dernier Clic</TableHead>
                      <TableHead>Propriété Favorite</TableHead>
                      <TableHead>Agent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedAnalytics.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          Aucune donnée disponible
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedAnalytics.map((lead) => {
                        const heat = getHeatLevel(lead.totalClicks);
                        return (
                          <TableRow
                            key={lead.leadId}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => navigate(`/leads/${lead.leadId}`)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${heat.color}`} />
                                <Badge variant={heat.variant} className="text-xs">
                                  {heat.label}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{lead.leadName}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{lead.leadEmail}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {lead.leadStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="font-semibold">{lead.totalClicks}</span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(lead.lastClickDate)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {lead.mostViewedProperty ? (
                                <div>
                                  <div className="font-medium truncate max-w-[200px]">
                                    {lead.mostViewedProperty.title}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {lead.mostViewedProperty.clicks} vues
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {lead.assignedTo || '-'}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeadsAnalytics;
