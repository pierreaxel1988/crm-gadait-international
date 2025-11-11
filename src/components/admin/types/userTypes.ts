
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
  { id: '1', name: 'Pierre-Axel Gadait', email: 'pierre@gadait-international.com', role: 'Admin' },
  { id: '2', name: 'Christelle Gadait', email: 'christelle@gadait-international.com', role: 'Admin' },
  { id: '3', name: 'Christine Francoise', email: 'admin@gadait-international.com', role: 'Admin' },
  { id: '4', name: 'Chloe Valentin', email: 'chloe@gadait-international.com', role: 'Admin' },
  { id: '5', name: 'Jade Diouane', email: 'jade@gadait-international.com', role: 'Commercial' },
  { id: '6', name: 'Ophelie Durand', email: 'ophelie@gadait-international.com', role: 'Commercial' },
  { id: '7', name: 'Jean Marc Perrissol', email: 'jeanmarc@gadait-international.com', role: 'Commercial' },
  { id: '8', name: 'Jacques Charles', email: 'jacques@gadait-international.com', role: 'Commercial' },
  { id: '9', name: 'Sharon Ramdiane', email: 'sharon@gadait-international.com', role: 'Commercial' },
  { id: '10', name: 'Matthieu Lapierre', email: 'matthieu@gadait-international.com', role: 'Commercial' },
  { id: '11', name: 'Fleurs Samuelson', email: 'fleurs@gadait-international.com', role: 'Commercial' },
];
