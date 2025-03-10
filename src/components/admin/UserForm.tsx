
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, ROLE_OPTIONS } from './types/userTypes';

interface UserFormProps {
  newUser: Omit<User, 'id'>;
  setNewUser: React.Dispatch<React.SetStateAction<Omit<User, 'id'>>>;
  onAddUser: () => void;
  onCancel: () => void;
}

const UserForm = ({ newUser, setNewUser, onAddUser, onCancel }: UserFormProps) => {
  return (
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
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button className="w-full" onClick={onAddUser}>Ajouter</Button>
            <Button variant="outline" className="w-full" onClick={onCancel}>Annuler</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserForm;
