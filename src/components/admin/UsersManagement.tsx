
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { User, MOCK_USERS } from './types/userTypes';
import UserForm from './UserForm';
import UserList from './UserList';

const UsersManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({ name: '', email: '', role: 'Visiteur' });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('Tous');

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

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setRoleFilter('Tous');
  };

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
        <UserForm 
          newUser={newUser}
          setNewUser={setNewUser}
          onAddUser={handleAddUser}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Liste des utilisateurs */}
      <UserList 
        users={users}
        editingUserId={editingUserId}
        editingUser={editingUser}
        setEditingUser={setEditingUser}
        onStartEditing={startEditing}
        onSaveChanges={saveUserChanges}
        onCancelEditing={cancelEditing}
        onDeleteUser={handleDeleteUser}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
      />
    </div>
  );
};

export default UsersManagement;
