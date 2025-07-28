import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Save, Trash2 } from 'lucide-react';
import CustomButton from '../ui/CustomButton';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Type pour chaque entrée de données du graphique
interface ChartEntry {
  id?: string;
  period_name: string;
  leads_count: number;
  source_name: string;
  monthly_cost: number;
  period_date?: string;
}

interface ChartDataFormProps {
  onSave?: (data: ChartEntry[]) => void;
}

const ChartDataForm: React.FC<ChartDataFormProps> = ({ onSave }) => {
  const [entries, setEntries] = useState<ChartEntry[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newEntry, setNewEntry] = useState<ChartEntry>({ 
    period_name: '', 
    leads_count: 0, 
    source_name: '', 
    monthly_cost: 0 
  });
  const { toast } = useToast();

  // Charger les données depuis Supabase
  const loadChartData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chart_data_entries')
        .select('*')
        .order('period_date', { ascending: true });

      if (error) throw error;
      
      setEntries(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du graphique",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChartData();
  }, []);

  const handleFieldChange = (index: number, field: keyof ChartEntry, value: string | number) => {
    const newEntries = [...entries];
    (newEntries[index] as any)[field] = value;
    setEntries(newEntries);
  };

  const handleDeleteEntry = async (index: number) => {
    const entry = entries[index];
    
    if (entry.id) {
      try {
        const { error } = await supabase
          .from('chart_data_entries')
          .delete()
          .eq('id', entry.id);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Entrée supprimée avec succès",
        });
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'entrée",
          variant: "destructive",
        });
        return;
      }
    }

    const newEntries = [...entries];
    newEntries.splice(index, 1);
    setEntries(newEntries);
  };

  const handleAddEntry = () => {
    if (newEntry.period_name.trim() === '' || newEntry.source_name.trim() === '') {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    // Générer une date pour la période (1er du mois de l'année courante)
    const currentYear = new Date().getFullYear();
    const monthNames = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc'];
    const monthIndex = monthNames.findIndex(m => m.toLowerCase() === newEntry.period_name.toLowerCase().slice(0, 3));
    const periodDate = monthIndex >= 0 ? `${currentYear}-${(monthIndex + 1).toString().padStart(2, '0')}-01` : undefined;

    const entryWithDate = {
      ...newEntry,
      period_date: periodDate
    };

    setEntries([...entries, entryWithDate]);
    setNewEntry({ period_name: '', leads_count: 0, source_name: '', monthly_cost: 0 });
    setIsAddDialogOpen(false);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Supprimer toutes les entrées existantes
      await supabase.from('chart_data_entries').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Insérer les nouvelles entrées
      const { error } = await supabase
        .from('chart_data_entries')
        .insert(entries.map(entry => ({
          period_name: entry.period_name,
          leads_count: entry.leads_count,
          source_name: entry.source_name,
          monthly_cost: entry.monthly_cost,
          period_date: entry.period_date
        })));

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Données sauvegardées avec succès!",
      });

      if (onSave) {
        onSave(entries);
      }

      // Recharger les données pour récupérer les IDs
      await loadChartData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-normal">Gestion des données du graphique</CardTitle>
        <CardDescription>
          Modifiez les valeurs mensuelles, sources et coûts pour le graphique d'acquisition de leads
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading && entries.length === 0 ? (
            <div className="text-center py-8">Chargement...</div>
          ) : (
            <>
              {/* En-têtes des colonnes */}
              <div className="grid grid-cols-5 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                <div>Période</div>
                <div>Nombre de leads</div>
                <div>Source</div>
                <div>Coût mensuel (€)</div>
                <div>Actions</div>
              </div>

              {entries.map((entry, index) => (
                <div key={entry.id || index} className="grid grid-cols-5 gap-4 items-end">
                  <div>
                    <Input
                      value={entry.period_name}
                      onChange={(e) => handleFieldChange(index, 'period_name', e.target.value)}
                      placeholder="ex: Jan, Fév..."
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      value={entry.leads_count}
                      onChange={(e) => handleFieldChange(index, 'leads_count', Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Input
                      value={entry.source_name}
                      onChange={(e) => handleFieldChange(index, 'source_name', e.target.value)}
                      placeholder="ex: Google Ads, Facebook..."
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      step="0.01"
                      value={entry.monthly_cost}
                      onChange={(e) => handleFieldChange(index, 'monthly_cost', Number(e.target.value))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleDeleteEntry(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une entrée
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle entrée</DialogTitle>
              <DialogDescription>
                Entrez les informations pour ajouter une nouvelle période au graphique.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-period">Période</Label>
                <Input
                  id="new-period"
                  placeholder="ex: Jan, Fév, Mar..."
                  value={newEntry.period_name}
                  onChange={(e) => setNewEntry({ ...newEntry, period_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-leads">Nombre de leads</Label>
                <Input
                  id="new-leads"
                  type="number"
                  placeholder="0"
                  value={newEntry.leads_count}
                  onChange={(e) => setNewEntry({ ...newEntry, leads_count: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-source">Source</Label>
                <Input
                  id="new-source"
                  placeholder="ex: Google Ads, Facebook, SEO..."
                  value={newEntry.source_name}
                  onChange={(e) => setNewEntry({ ...newEntry, source_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-cost">Coût mensuel (€)</Label>
                <Input
                  id="new-cost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newEntry.monthly_cost}
                  onChange={(e) => setNewEntry({ ...newEntry, monthly_cost: Number(e.target.value) })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleAddEntry}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <CustomButton 
          onClick={handleSave} 
          className="bg-gray-900 hover:bg-gray-800 text-white"
          disabled={loading}
        >
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </CustomButton>
      </CardFooter>
    </Card>
  );
};

export default ChartDataForm;