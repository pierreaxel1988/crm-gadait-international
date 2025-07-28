
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, PencilIcon, TrashIcon } from 'lucide-react';
import { User, ROLE_OPTIONS } from './types/userTypes';

interface UserActionsProps {
  user: User;
  editingUserId: string | null;
  editingUser: User | null;
  setEditingUser: React.Dispatch<React.SetStateAction<User | null>>;
  onStartEditing: (user: User) => void;
  onSaveChanges: () => void;
  onCancelEditing: () => void;
  onDeleteUser: (id: string) => void;
}

const UserActions = ({ 
  user, 
  editingUserId, 
  editingUser, 
  setEditingUser, 
  onStartEditing, 
  onSaveChanges, 
  onCancelEditing, 
  onDeleteUser 
}: UserActionsProps) => {
  if (editingUserId === user.id) {
    return (
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
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex space-x-2 ml-4">
          <Button size="icon" variant="ghost" onClick={onSaveChanges}><Check className="h-4 w-4" /></Button>
          <Button size="icon" variant="ghost" onClick={onCancelEditing}><X className="h-4 w-4" /></Button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex-1 grid grid-cols-3 gap-4">
        <div>
          <p className="font-medium">{user.name}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div>
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs">
            {user.role}
          </span>
        </div>
      </div>
      <div className="flex space-x-2 ml-4">
        <Button size="icon" variant="ghost" onClick={() => onStartEditing(user)}>
          <PencilIcon className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => onDeleteUser(user.id)}>
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default UserActions;
