import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Calendar, Eye, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PropertySelection {
  id: string;
  name: string;
  properties: string[];
  property_criteria: any;
  email_sent_at: string | null;
  email_opened_at: string | null;
  link_visited_at: string | null;
  status: string;
  created_at: string;
}

interface PropertySelectionHistoryProps {
  leadId: string;
}

const PropertySelectionHistory: React.FC<PropertySelectionHistoryProps> = ({ leadId }) => {
  const [selections, setSelections] = useState<PropertySelection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSelectionHistory();
  }, [leadId]);

  const fetchSelectionHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('property_selections')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération de l\'historique:', error);
        return;
      }

      setSelections(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (selection: PropertySelection) => {
    if (selection.link_visited_at) {
      return <Badge className="bg-green-100 text-green-800">Lien visité</Badge>;
    }
    if (selection.email_opened_at) {
      return <Badge className="bg-blue-100 text-blue-800">Email ouvert</Badge>;
    }
    if (selection.email_sent_at) {
      return <Badge className="bg-yellow-100 text-yellow-800">Envoyé</Badge>;
    }
    return <Badge variant="outline">Brouillon</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (selections.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Mail className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune sélection envoyée
          </h3>
          <p className="text-gray-500">
            Les sélections de propriétés envoyées à ce client apparaîtront ici.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Historique des envois ({selections.length})
      </h3>
      
      {selections.map((selection) => (
        <Card key={selection.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base font-medium">
                  {selection.name}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {selection.properties.length} propriété{selection.properties.length > 1 ? 's' : ''} sélectionnée{selection.properties.length > 1 ? 's' : ''}
                </p>
              </div>
              {getStatusBadge(selection)}
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Créé le {format(new Date(selection.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                  </span>
                </div>
              </div>

              {selection.email_sent_at && (
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span>
                      Envoyé le {format(new Date(selection.email_sent_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </span>
                  </div>
                </div>
              )}

              {selection.email_opened_at && (
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>
                      Ouvert le {format(new Date(selection.email_opened_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </span>
                  </div>
                </div>
              )}

              {selection.link_visited_at && (
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <ExternalLink className="h-4 w-4" />
                    <span>
                      Lien visité le {format(new Date(selection.link_visited_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </span>
                  </div>
                </div>
              )}

              {selection.property_criteria && selection.property_criteria.sender_name && (
                <div className="text-sm text-gray-500">
                  Envoyé par: {selection.property_criteria.sender_name}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PropertySelectionHistory;