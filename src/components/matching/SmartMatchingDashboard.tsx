
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Target, TrendingUp, Users, Home, Mail, Phone, ExternalLink, Zap, Crown, Star, Award } from 'lucide-react';
import { aiMatchingEngine } from '@/services/aiMatching';
import type { LeadDetailed } from '@/types/lead';
import { toast } from '@/hooks/use-toast';

interface PropertyMatch {
  id: string;
  title: string;
  price?: number;
  location?: string;
  country?: string;
  property_type?: string;
  bedrooms?: number;
  main_image?: string;
  url: string;
  score: number;
  reasons: string[];
  matchType: 'perfect' | 'excellent' | 'good' | 'potential';
}

interface LeadMatchResult {
  lead: LeadDetailed;
  matches: PropertyMatch[];
  totalScore: number;
}

const SmartMatchingDashboard: React.FC = () => {
  const [topMatches, setTopMatches] = useState<LeadMatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadInitialMatches();
  }, []);

  const loadInitialMatches = async () => {
    try {
      setLoading(true);
      console.log('Chargement des matches initiaux...');
      
      const matches = await aiMatchingEngine.findTopMatches(20);
      setTopMatches(matches);
      
      toast({
        title: "🎯 Analyse terminée",
        description: `${matches.length} opportunités de matching identifiées`,
      });
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les matches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const runFullAnalysis = async () => {
    try {
      setAnalyzing(true);
      console.log('Lancement de l\'analyse complète...');
      
      toast({
        title: "🧠 Analyse IA en cours...",
        description: "L'intelligence artificielle analyse vos leads et propriétés",
      });
      
      const matches = await aiMatchingEngine.findTopMatches(50);
      setTopMatches(matches);
      
      toast({
        title: "🚀 Analyse terminée",
        description: `${matches.length} nouvelles opportunités identifiées !`,
      });
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      toast({
        title: "Erreur d'analyse",
        description: "L'analyse IA a échoué",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getMatchTypeIcon = (type: string) => {
    switch (type) {
      case 'perfect': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'excellent': return <Award className="h-4 w-4 text-purple-500" />;
      case 'good': return <Star className="h-4 w-4 text-blue-500" />;
      default: return <Target className="h-4 w-4 text-green-500" />;
    }
  };

  const getMatchTypeColor = (type: string) => {
    switch (type) {
      case 'perfect': return 'bg-yellow-500';
      case 'excellent': return 'bg-purple-500';
      case 'good': return 'bg-blue-500';
      default: return 'bg-green-500';
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Prix sur demande';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleContactLead = (lead: LeadDetailed) => {
    if (lead.phone) {
      window.open(`tel:${lead.phone}`);
    } else if (lead.email) {
      window.open(`mailto:${lead.email}`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const totalLeads = topMatches.length;
  const perfectMatches = topMatches.filter(m => m.matches.some(match => match.matchType === 'perfect')).length;
  const excellentMatches = topMatches.filter(m => m.matches.some(match => match.matchType === 'excellent')).length;
  const totalProperties = topMatches.reduce((sum, m) => sum + m.matches.length, 0);

  return (
    <div className="space-y-6">
      {/* Header avec stats */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Matching IA Ultra-Performant
            </h1>
          </div>
          <p className="text-gray-600">
            Intelligence artificielle avancée pour matcher vos leads avec les propriétés parfaites
          </p>
        </div>
        
        <Button 
          onClick={runFullAnalysis}
          disabled={analyzing}
          className="bg-purple-600 hover:bg-purple-700"
          size="lg"
        >
          {analyzing ? (
            <>
              <Brain className="h-5 w-5 mr-2 animate-spin" />
              Analyse en cours...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5 mr-2" />
              Lancer l'analyse IA
            </>
          )}
        </Button>
      </div>

      {/* Stats rapides */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalLeads}</p>
                <p className="text-gray-600 text-sm">Leads analysés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{perfectMatches}</p>
                <p className="text-gray-600 text-sm">Matches parfaits</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{excellentMatches}</p>
                <p className="text-gray-600 text-sm">Matches excellents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Home className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{totalProperties}</p>
                <p className="text-gray-600 text-sm">Propriétés matchées</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="perfect">Matches parfaits</TabsTrigger>
          <TabsTrigger value="all">Tous les matches</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {topMatches.slice(0, 4).map((result) => (
              <Card key={result.lead.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{result.lead.name}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {result.lead.desiredLocation || result.lead.country} • 
                        Budget: {result.lead.budget || 'Non spécifié'}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {result.matches.length} match{result.matches.length > 1 ? 'es' : ''}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.matches.slice(0, 2).map((match) => (
                    <div key={match.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {match.main_image ? (
                          <img 
                            src={match.main_image} 
                            alt={match.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                            <Home className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getMatchTypeIcon(match.matchType)}
                          <h4 className="font-medium text-sm truncate">{match.title}</h4>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {match.location} • {formatPrice(match.price)}
                        </p>
                        <div className="flex items-center gap-2">
                          <Progress value={match.score * 100} className="flex-1 h-2" />
                          <span className="text-xs font-medium">{Math.round(match.score * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleContactLead(result.lead)}
                      size="sm" 
                      className="flex-1"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Contacter
                    </Button>
                    <Button 
                      onClick={() => window.open(`/leads/${result.lead.id}`, '_blank')}
                      variant="outline" 
                      size="sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="perfect" className="space-y-4">
          <div className="grid gap-4">
            {topMatches
              .filter(result => result.matches.some(match => match.matchType === 'perfect'))
              .map((result) => (
                <Card key={result.lead.id} className="border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Crown className="h-6 w-6 text-yellow-500" />
                      <div>
                        <CardTitle>{result.lead.name}</CardTitle>
                        <p className="text-sm text-gray-600">
                          {result.matches.filter(m => m.matchType === 'perfect').length} match(es) parfait(s)
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                      {result.matches
                        .filter(match => match.matchType === 'perfect')
                        .map((match) => (
                          <div key={match.id} className="flex gap-3 p-3 bg-white rounded-lg border">
                            <div className="flex-shrink-0">
                              {match.main_image ? (
                                <img 
                                  src={match.main_image} 
                                  alt={match.title}
                                  className="w-20 h-20 object-cover rounded"
                                />
                              ) : (
                                <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                                  <Home className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{match.title}</h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {match.location} • {formatPrice(match.price)}
                              </p>
                              <div className="space-y-1">
                                {match.reasons.slice(0, 2).map((reason, idx) => (
                                  <p key={idx} className="text-xs text-green-600">✓ {reason}</p>
                                ))}
                              </div>
                              <Button 
                                onClick={() => window.open(match.url, '_blank')}
                                size="sm" 
                                variant="outline" 
                                className="mt-2"
                              >
                                Voir propriété
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="space-y-4">
            {topMatches.map((result) => (
              <Card key={result.lead.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{result.lead.name}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {result.lead.email} • {result.lead.phone}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">
                        Score total: {Math.round(result.totalScore * 100)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-3">
                    {result.matches.map((match) => (
                      <div key={match.id} className="border rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          {getMatchTypeIcon(match.matchType)}
                          <div className={`w-2 h-2 rounded-full ${getMatchTypeColor(match.matchType)}`}></div>
                          <span className="text-sm font-medium capitalize">{match.matchType}</span>
                        </div>
                        <h4 className="font-medium text-sm mb-1">{match.title}</h4>
                        <p className="text-xs text-gray-600 mb-2">
                          {match.location} • {formatPrice(match.price)}
                        </p>
                        <Progress value={match.score * 100} className="mb-2 h-1" />
                        <div className="space-y-1">
                          {match.reasons.slice(0, 2).map((reason, idx) => (
                            <p key={idx} className="text-xs text-gray-500">• {reason}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartMatchingDashboard;
