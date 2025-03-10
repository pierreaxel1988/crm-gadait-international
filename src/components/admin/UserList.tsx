
import React from 'react';
import { User } from './types/userTypes';
import UserActions from './UserActions';
import { Input } from "@/components/ui/input";
import { Search, Filter } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_OPTIONS } from './types/userTypes';

interface UserListProps {
  users: User[];
  editingUserId: string | null;
  editingUser: User | null;
  setEditingUser: React.Dispatch<React.SetStateAction<User | null>>;
  onStartEditing: (user: User) => void;
  onSaveChanges: () => void;
  onCancelEditing: () => void;
  onDeleteUser: (id: string) => void;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  roleFilter: string;
  setRoleFilter: React.Dispatch<React.SetStateAction<string>>;
}

const UserList = ({ 
  users, 
  editingUserId, 
  editingUser, 
  setEditingUser, 
  onStartEditing, 
  onSaveChanges, 
  onCancelEditing, 
  onDeleteUser,
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter
}: UserListProps) => {
  // Filter users based on search term and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'Tous' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="w-full sm:w-[180px]">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filtrer par rôle" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tous">Tous les rôles</SelectItem>
              {ROLE_OPTIONS.map(role => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
        </div>
      ) : (
        <div className="divide-y rounded-md border">
          {filteredUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4">
              <UserActions 
                user={user}
                editingUserId={editingUserId}
                editingUser={editingUser}
                setEditingUser={setEditingUser}
                onStartEditing={onStartEditing}
                onSaveChanges={onSaveChanges}
                onCancelEditing={onCancelEditing}
                onDeleteUser={onDeleteUser}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserList;
