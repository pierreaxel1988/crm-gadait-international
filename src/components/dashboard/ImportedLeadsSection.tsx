
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ImportedLead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  property_reference: string | null;
  source: string | null;
  integration_source: string | null;
  imported_at: string | null;
}

const ImportedLeadsSection = () => {
  const [leads, setLeads] = useState<ImportedLead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImportedLeads = async () => {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('id, name, email, phone, property_reference, source, integration_source, imported_at')
          .not('imported_at', 'is', null)
          .order('imported_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setLeads(data || []);
      } catch (err) {
        console.error('Erreur lors du chargement des leads importés:', err);
        setError("Impossible de charger les leads importés");
      } finally {
        setLoading(false);
      }
    };

    fetchImportedLeads();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    try {
      return format(new Date(dateString), 'dd MMM yyyy HH:mm', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  const getSourceBadge = (source: string | null, integration_source: string | null) => {
    const sourceText = integration_source || source || 'Inconnu';
    let color = 'bg-gray-200 text-gray-800';
    
    if (sourceText.includes('Figaro')) {
      color = 'bg-blue-100 text-blue-800';
    } else if (sourceText.includes('Properstar')) {
      color = 'bg-green-100 text-green-800';
    } else if (sourceText.includes('Property Cloud')) {
      color = 'bg-purple-100 text-purple-800';
    } else if (sourceText.includes('Idealista')) {
      color = 'bg-red-100 text-red-800';
    }
    
    return (
      <Badge className={`${color} border-0`}>
        {sourceText}
      </Badge>
    );
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Derniers leads importés</CardTitle>
        <Badge variant="outline" className="ml-2">
          {leads.length} leads
        </Badge>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-loro-navy" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : leads.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Aucun lead importé récemment
          </div>
        ) : (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Importé le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                        {lead.email}
                      </a>
                    </TableCell>
                    <TableCell>
                      {lead.phone ? (
                        <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                          {lead.phone}
                        </a>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      {lead.property_reference ? (
                        <div className="flex items-center">
                          <span className="font-mono text-sm">{lead.property_reference}</span>
                          {lead.property_reference.startsWith('http') && (
                            <a 
                              href={lead.property_reference} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="ml-1 text-blue-600"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      {getSourceBadge(lead.source, lead.integration_source)}
                    </TableCell>
                    <TableCell>{formatDate(lead.imported_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImportedLeadsSection;
