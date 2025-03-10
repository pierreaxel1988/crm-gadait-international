
import React from 'react';
import { User } from './types/userTypes';
import UserActions from './UserActions';

interface UserListProps {
  users: User[];
  editingUserId: string | null;
  editingUser: User | null;
  setEditingUser: React.Dispatch<React.SetStateAction<User | null>>;
  onStartEditing: (user: User) => void;
  onSaveChanges: () => void;
  onCancelEditing: () => void;
  onDeleteUser: (id: string) => void;
}

const UserList = ({ 
  users, 
  editingUserId, 
  editingUser, 
  setEditingUser, 
  onStartEditing, 
  onSaveChanges, 
  onCancelEditing, 
  onDeleteUser 
}: UserListProps) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
      </div>
    );
  }

  return (
    <div className="divide-y rounded-md border">
      {users.map((user) => (
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
  );
};

export default UserList;
