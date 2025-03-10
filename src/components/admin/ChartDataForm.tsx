
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Save, Trash2 } from 'lucide-react';
import CustomButton from '../ui/CustomButton';

// Type pour chaque entrée de données du graphique
interface ChartEntry {
  name: string;
  total: number;
}

interface ChartDataFormProps {
  initialData?: ChartEntry[];
  onSave?: (data: ChartEntry[]) => void;
}

const ChartDataForm: React.FC<ChartDataFormProps> = ({ 
  initialData = [
    { name: 'Jan', total: 0 }, 
    { name: 'Feb', total: 0 }
  ],
  onSave 
}) => {
  const [entries, setEntries] = useState<ChartEntry[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState<ChartEntry>({ name: '', total: 0 });

  // Charger les données initiales ou depuis le stockage local
  useEffect(() => {
    const savedData = localStorage.getItem('adminChartData');
    if (savedData) {
      try {
        setEntries(JSON.parse(savedData));
      } catch (e) {
        console.error('Erreur lors du chargement des données:', e);
        setEntries(initialData);
      }
    } else {
      setEntries(initialData);
    }
  }, [initialData]);

  const handleValueChange = (index: number, value: number) => {
    const newEntries = [...entries];
    newEntries[index].total = value;
    setEntries(newEntries);
  };

  const handleNameChange = (index: number, name: string) => {
    const newEntries = [...entries];
    newEntries[index].name = name;
    setEntries(newEntries);
  };

  const handleDeleteEntry = (index: number) => {
    const newEntries = [...entries];
    newEntries.splice(index, 1);
    setEntries(newEntries);
  };

  const handleAddEntry = () => {
    if (newEntry.name.trim() === '') {
      return;
    }
    setEntries([...entries, { ...newEntry }]);
    setNewEntry({ name: '', total: 0 });
    setIsAddDialogOpen(false);
  };

  const handleSave = () => {
    localStorage.setItem('adminChartData', JSON.stringify(entries));
    if (onSave) {
      onSave(entries);
    }
    // Afficher un message de confirmation
    alert('Données sauvegardées avec succès!');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gestion des données du graphique</CardTitle>
        <CardDescription>
          Modifiez les valeurs mensuelles pour le graphique d'acquisition de leads
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-1/3">
                <Label htmlFor={`name-${index}`}>Mois</Label>
                <Input
                  id={`name-${index}`}
                  value={entry.name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                />
              </div>
              <div className="w-1/3">
                <Label htmlFor={`value-${index}`}>Valeur (€)</Label>
                <Input
                  id={`value-${index}`}
                  type="number"
                  value={entry.total}
                  onChange={(e) => handleValueChange(index, Number(e.target.value))}
                />
              </div>
              <div className="flex items-end h-[42px]">
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
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un mois
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau mois</DialogTitle>
              <DialogDescription>
                Entrez le nom du mois et sa valeur pour l'ajouter au graphique.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-month">Nom du mois</Label>
                <Input
                  id="new-month"
                  placeholder="ex: Jan, Fév, Mar..."
                  value={newEntry.name}
                  onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-value">Valeur (€)</Label>
                <Input
                  id="new-value"
                  type="number"
                  placeholder="0"
                  value={newEntry.total}
                  onChange={(e) => setNewEntry({ ...newEntry, total: Number(e.target.value) })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleAddEntry}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <CustomButton onClick={handleSave} className="bg-gray-900 hover:bg-gray-800 text-white">
          <Save className="mr-2 h-4 w-4" />
          Sauvegarder
        </CustomButton>
      </CardFooter>
    </Card>
  );
};

export default ChartDataForm;
