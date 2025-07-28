import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { getLeads } from '@/services/leadCore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as XLSX from 'xlsx';

const LeadsExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const formatLeadData = (leads: any[]) => {
    return leads.map(lead => ({
      'Nom': lead.name || '',
      'Email': lead.email || '',
      'Téléphone': lead.phone || '',
      'Pays d\'intérêt': lead.country || '',
      'Localisation souhaitée': lead.desiredLocation || lead.location || '',
      'Budget': lead.budget || '',
      'Statut': lead.status || '',
      'Agent assigné': lead.assignedTo ? 
        (lead.assigned_team_member?.name || 'Agent assigné') : 'Non assigné',
      'Date de création': lead.createdAt ? 
        format(new Date(lead.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr }) : '',
      'Nationalité': lead.nationality || '',
      'Type de propriété': Array.isArray(lead.propertyTypes) ? 
        lead.propertyTypes.join(', ') : (lead.propertyType || ''),
      'Nombre de chambres': lead.bedrooms || '',
      'Source': lead.source || '',
      'Pipeline': lead.pipelineType || '',
      'Tags': Array.isArray(lead.tags) ? lead.tags.join(', ') : '',
      'Notes': lead.notes || ''
    }));
  };

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      const leads = await getLeads();
      const formattedData = formatLeadData(leads);
      
      if (formattedData.length === 0) {
        toast.error('Aucune donnée à exporter');
        return;
      }

      // Créer les en-têtes CSV
      const headers = Object.keys(formattedData[0]);
      const csvContent = [
        headers.join(','),
        ...formattedData.map(row => 
          headers.map(header => {
            const value = row[header] || '';
            // Échapper les guillemets et entourer de guillemets si nécessaire
            const escapedValue = value.toString().replace(/"/g, '""');
            return `"${escapedValue}"`;
          }).join(',')
        )
      ].join('\n');

      // Télécharger le fichier
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `leads_export_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`${formattedData.length} leads exportés en CSV`);
    } catch (error) {
      console.error('Erreur lors de l\'export CSV:', error);
      toast.error('Erreur lors de l\'export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const leads = await getLeads();
      const formattedData = formatLeadData(leads);
      
      if (formattedData.length === 0) {
        toast.error('Aucune donnée à exporter');
        return;
      }

      // Créer un nouveau workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(formattedData);

      // Ajuster la largeur des colonnes
      const colWidths = Object.keys(formattedData[0]).map(key => ({
        wch: Math.max(key.length, 20)
      }));
      ws['!cols'] = colWidths;

      // Ajouter la feuille au workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Leads');

      // Télécharger le fichier
      XLSX.writeFile(wb, `leads_export_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`);

      toast.success(`${formattedData.length} leads exportés en Excel`);
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
      toast.error('Erreur lors de l\'export Excel');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Export des leads</h3>
        <p className="text-sm text-muted-foreground">
          Exportez votre base de données clients pour vos campagnes mailing
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Export CSV
            </CardTitle>
            <CardDescription>
              Format simple pour la plupart des outils de mailing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={exportToCSV} 
              disabled={isExporting}
              className="w-full"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Export en cours...' : 'Exporter en CSV'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Export Excel
            </CardTitle>
            <CardDescription>
              Format Excel avec mise en forme pour analyse avancée
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={exportToExcel} 
              disabled={isExporting}
              className="w-full"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Export en cours...' : 'Exporter en Excel'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-sm text-muted-foreground space-y-1">
        <p><strong>Données exportées :</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Informations de contact (nom, email, téléphone)</li>
          <li>Localisation et pays d'intérêt</li>
          <li>Budget et critères de recherche</li>
          <li>Statut et agent assigné</li>
          <li>Source et pipeline</li>
          <li>Notes et tags</li>
        </ul>
      </div>
    </div>
  );
};

export default LeadsExport;