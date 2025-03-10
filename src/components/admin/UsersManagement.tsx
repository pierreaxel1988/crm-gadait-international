
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PencilIcon, TrashIcon, UserPlus, Check, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Types pour représenter un utilisateur
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Données mockées pour les utilisateurs avec l'équipe commerciale ajoutée
const mockUsers: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'Admin' },
  { id: '2', name: 'John Doe', email: 'john@example.com', role: 'Éditeur' },
  { id: '3', name: 'Jane Smith', email: 'jane@example.com', role: 'Visiteur' },
  { id: '4', name: 'Jade Diouane', email: 'jade@gadait-international.com', role: 'Commercial' },
  { id: '5', name: 'Ophelie Durand', email: 'ophelie@gadait-international.com', role: 'Commercial' },
  { id: '6', name: 'Jean Marc Perrissol', email: 'jeanmarc@gadait-international.com', role: 'Commercial' },
  { id: '7', name: 'Jacques Charles', email: 'jacques@gadait-international.com', role: 'Commercial' },
  { id: '8', name: 'Sharon Ramdiane', email: 'sharon@gadait-international.com', role: 'Commercial' },
];

const UsersManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Visiteur' });
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Simuler l'ajout d'un utilisateur
  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }
    
    const id = Math.random().toString(36).substring(2, 9);
    const userToAdd = { ...newUser, id };
    setUsers([...users, userToAdd]);
    setNewUser({ name: '', email: '', role: 'Visiteur' });
    setShowAddForm(false);
    toast.success('Utilisateur ajouté avec succès');
  };

  // Simuler la suppression d'un utilisateur
  const handleDeleteUser = (id: string) => {
    // Ne pas permettre la suppression de l'utilisateur actuel
    if (user && user.email === users.find(u => u.id === id)?.email) {
      toast.error('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }
    
    setUsers(users.filter(user => user.id !== id));
    toast.success('Utilisateur supprimé avec succès');
  };

  // Démarrer l'édition d'un utilisateur
  const startEditing = (user: User) => {
    setEditingUserId(user.id);
    setEditingUser({ ...user });
  };

  // Sauvegarder les modifications
  const saveUserChanges = () => {
    if (!editingUser) return;
    
    setUsers(users.map(user => user.id === editingUserId ? editingUser : user));
    setEditingUserId(null);
    setEditingUser(null);
    toast.success('Utilisateur mis à jour avec succès');
  };

  // Annuler l'édition
  const cancelEditing = () => {
    setEditingUserId(null);
    setEditingUser(null);
  };

  // Options de rôle
  const roleOptions = ['Admin', 'Éditeur', 'Visiteur', 'Commercial'];

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Liste des utilisateurs</h3>
        <Button 
          variant="outline" 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          {showAddForm ? 'Annuler' : 'Ajouter un utilisateur'}
        </Button>
      </div>

      {/* Formulaire d'ajout d'utilisateur */}
      {showAddForm && (
        <Card className="mb-6 bg-muted/20">
          <CardContent className="pt-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="new-name">Nom</Label>
                <Input 
                  id="new-name" 
                  value={newUser.name} 
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-email">Email</Label>
                <Input 
                  id="new-email" 
                  type="email" 
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-role">Rôle</Label>
                <select 
                  id="new-role" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <Button className="w-full" onClick={handleAddUser}>Ajouter</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des utilisateurs */}
      <div className="divide-y rounded-md border">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-4">
            {editingUserId === user.id ? (
              <>
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div>
                    <Input 
                      value={editingUser?.name || ''} 
                      onChange={(e) => setEditingUser({...editingUser!, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Input 
                      value={editingUser?.email || ''}
                      onChange={(e) => setEditingUser({...editingUser!, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={editingUser?.role}
                      onChange={(e) => setEditingUser({...editingUser!, role: e.target.value})}
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button size="icon" variant="ghost" onClick={saveUserChanges}><Check className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={cancelEditing}><X className="h-4 w-4" /></Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div>
                    <p className="font-medium">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                      {user.role}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button size="icon" variant="ghost" onClick={() => startEditing(user)}>
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDeleteUser(user.id)}>
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
