
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

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

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Derniers leads importés</CardTitle>
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
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.phone || '—'}</TableCell>
                  <TableCell>{lead.property_reference || '—'}</TableCell>
                  <TableCell>
                    {lead.integration_source || lead.source || '—'}
                  </TableCell>
                  <TableCell>{formatDate(lead.imported_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ImportedLeadsSection;
