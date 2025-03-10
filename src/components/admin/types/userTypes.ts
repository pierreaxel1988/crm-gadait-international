
// Types pour représenter un utilisateur
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Options de rôle
export const ROLE_OPTIONS = ['Admin', 'Éditeur', 'Visiteur', 'Commercial'];

// Données mockées pour les utilisateurs avec l'équipe commerciale
export const MOCK_USERS: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'Admin' },
  { id: '2', name: 'John Doe', email: 'john@example.com', role: 'Éditeur' },
  { id: '3', name: 'Jane Smith', email: 'jane@example.com', role: 'Visiteur' },
  { id: '4', name: 'Jade Diouane', email: 'jade@gadait-international.com', role: 'Commercial' },
  { id: '5', name: 'Ophelie Durand', email: 'ophelie@gadait-international.com', role: 'Commercial' },
  { id: '6', name: 'Jean Marc Perrissol', email: 'jeanmarc@gadait-international.com', role: 'Commercial' },
  { id: '7', name: 'Jacques Charles', email: 'jacques@gadait-international.com', role: 'Commercial' },
  { id: '8', name: 'Sharon Ramdiane', email: 'sharon@gadait-international.com', role: 'Commercial' },
];
