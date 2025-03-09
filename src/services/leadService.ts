import { LeadDetailed } from "@/types/lead";
import { LeadStatus } from "@/components/common/StatusBadge";
import { LeadTag } from "@/components/common/TagBadge";
import { TaskType } from "@/components/kanban/KanbanCard";
import { toast } from "@/hooks/use-toast";

// Mock data avec des champs étendus
const mockLeadsDetailed: LeadDetailed[] = [
  {
    id: '1',
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    phone: '+33 6 12 34 56 78',
    location: 'Paris, France',
    status: 'Qualified',
    tags: ['Vip', 'Hot'],
    assignedTo: 'Sophie Martin',
    createdAt: '2023-06-15',
    lastContactedAt: '2023-06-18',
    source: 'Site web',
    propertyReference: 'VIL-789-PR',
    budget: '1.500.000€ - 2.000.000€',
    desiredLocation: 'Côte d\'Azur',
    propertyType: 'Villa',
    livingArea: '200-300m²',
    bedrooms: 4,
    views: ['Mer'],
    amenities: ['Piscine', 'Jardin', 'Garage'],
    purchaseTimeframe: 'Moins de trois mois',
    financingMethod: 'Cash',
    propertyUse: 'Résidence principale',
    nationality: 'France',
    taxResidence: 'France',
    nextFollowUpDate: '2023-07-01',
    notes: 'Client très sérieux et pressé',
    taskType: 'Visites',
  },
  {
    id: '2',
    name: 'Marie Lambert',
    email: 'marie.lambert@example.com',
    phone: '+33 6 23 45 67 89',
    location: 'Lyon, France',
    status: 'New',
    tags: ['Serious'],
    assignedTo: 'Thomas Bernard',
    createdAt: '2023-06-17',
    source: 'Recommandations',
    propertyReference: 'APT-456-LY',
    budget: '800.000€ - 1.200.000€',
    desiredLocation: 'Lyon centre',
    propertyType: 'Appartement',
    livingArea: '100-150m²',
    bedrooms: 3,
    views: ['Autres'],
    amenities: ['Garage', 'Sécurité'],
    purchaseTimeframe: 'Plus de trois mois',
    financingMethod: 'Prêt bancaire',
    propertyUse: 'Résidence principale',
    nationality: 'France',
    taxResidence: 'France',
    taskType: 'Call',
  },
  {
    id: '3',
    name: 'Pierre Moreau',
    email: 'pierre.moreau@example.com',
    phone: '+33 6 34 56 78 90',
    location: 'Nice, France',
    status: 'Contacted',
    tags: ['Cold', 'No response'],
    assignedTo: 'Julie Dubois',
    createdAt: '2023-06-14',
    lastContactedAt: '2023-06-16',
    source: 'Portails immobiliers',
    propertyReference: 'PEN-123-NI',
    budget: '2.000.000€ - 3.000.000€',
    desiredLocation: 'Nice Promenade',
    propertyType: 'Penthouse',
    livingArea: '150-200m²',
    bedrooms: 3,
    views: ['Mer', 'Montagne'],
    amenities: ['Piscine', 'Sécurité'],
    purchaseTimeframe: 'Plus de trois mois',
    financingMethod: 'Cash',
    propertyUse: 'Investissement locatif',
    nationality: 'Belgique',
    taxResidence: 'Belgique',
    nextFollowUpDate: '2023-07-10',
    notes: 'Difficile à joindre, semblait intéressé initialement',
    taskType: 'Follow up',
  },
  {
    id: '4',
    name: 'Claire Simon',
    email: 'claire.simon@example.com',
    location: 'Cannes, France',
    status: 'Visit',
    tags: ['Hot'],
    assignedTo: 'Lucas Petit',
    createdAt: '2023-06-12',
    lastContactedAt: '2023-06-16',
    source: 'Network',
    propertyReference: 'VIL-234-CA',
    budget: '5.000.000€ +',
    desiredLocation: 'Cannes Californie',
    propertyType: 'Villa',
    livingArea: '400m² +',
    bedrooms: 5,
    views: ['Mer'],
    amenities: ['Piscine', 'Jardin', 'Garage', 'Sécurité'],
    purchaseTimeframe: 'Moins de trois mois',
    financingMethod: 'Cash',
    propertyUse: 'Résidence principale',
    nationality: 'Royaume-Uni',
    taxResidence: 'Royaume-Uni',
    nextFollowUpDate: '2023-06-25',
    notes: 'Visite programmée pour 3 propriétés',
    taskType: 'Document',
  },
  {
    id: '5',
    name: 'Antoine Richard',
    email: 'antoine.richard@example.com',
    phone: '+33 6 56 78 90 12',
    location: 'Bordeaux, France',
    status: 'Proposal',
    tags: ['Serious'],
    assignedTo: 'Sophie Martin',
    createdAt: '2023-06-10',
    lastContactedAt: '2023-06-15',
    source: 'Site web',
    propertyReference: 'VIG-567-BO',
    budget: '3.000.000€ - 6.000.000€',
    desiredLocation: 'Région Bordeaux',
    propertyType: 'Vignoble',
    livingArea: '500m² +',
    bedrooms: 6,
    views: ['Autres'],
    amenities: ['Jardin'],
    purchaseTimeframe: 'Plus de trois mois',
    financingMethod: 'Prêt bancaire',
    propertyUse: 'Investissement locatif',
    nationality: 'France',
    taxResidence: 'Suisse',
    nextFollowUpDate: '2023-06-28',
    notes: 'Intéressé par l\'exploitation viticole, pas seulement l\'immobilier',
    taskType: 'Review',
  },
  {
    id: '6',
    name: 'Camille Martin',
    email: 'camille.martin@example.com',
    phone: '+33 6 67 89 01 23',
    location: 'Marseille, France',
    status: 'New',
    tags: ['No phone', 'Cold'],
    createdAt: '2023-06-18',
    source: 'Réseaux sociaux',
    propertyReference: 'APT-890-MA',
    budget: '500.000€ - 700.000€',
    desiredLocation: 'Marseille centre ou littoral',
    propertyType: 'Appartement',
    livingArea: '80-120m²',
    bedrooms: 2,
    views: ['Mer'],
    amenities: ['Garage'],
    purchaseTimeframe: 'Plus de trois mois',
    financingMethod: 'Prêt bancaire',
    propertyUse: 'Résidence principale',
    nationality: 'France',
    taxResidence: 'France',
    taskType: 'Reminder',
  },
];

// Variable pour stocker les leads en mémoire
let leadsData = [...mockLeadsDetailed];

export const getLeads = (): LeadDetailed[] => {
  return leadsData;
};

export const getLead = (id: string): LeadDetailed | undefined => {
  return leadsData.find(lead => lead.id === id);
};

export const updateLead = (updatedLead: LeadDetailed): LeadDetailed => {
  const index = leadsData.findIndex(lead => lead.id === updatedLead.id);
  
  if (index !== -1) {
    leadsData[index] = updatedLead;
    toast({
      title: "Lead mis à jour",
      description: `Les informations pour ${updatedLead.name} ont été enregistrées.`
    });
    return updatedLead;
  } else {
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de trouver le lead demandé."
    });
    throw new Error("Lead not found");
  }
};

export const createLead = (newLead: Omit<LeadDetailed, 'id' | 'createdAt'>): LeadDetailed => {
  const id = (leadsData.length + 1).toString();
  const createdAt = new Date().toISOString().split('T')[0];
  
  const lead = {
    id,
    createdAt,
    ...newLead
  };
  
  leadsData.unshift(lead);
  
  toast({
    title: "Nouveau lead créé",
    description: `Le lead ${lead.name} a été ajouté avec succès.`
  });
  
  return lead;
};

export const deleteLead = (id: string): boolean => {
  const initialLength = leadsData.length;
  leadsData = leadsData.filter(lead => lead.id !== id);
  
  if (leadsData.length < initialLength) {
    toast({
      title: "Lead supprimé",
      description: "Le lead a été supprimé avec succès."
    });
    return true;
  }
  
  toast({
    variant: "destructive",
    title: "Erreur",
    description: "Impossible de trouver le lead à supprimer."
  });
  return false;
};

// Convertir les types détaillés en types simplifiés pour la compatibilité avec les composants existants
export const convertToSimpleLead = (lead: LeadDetailed) => {
  return {
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    location: lead.location,
    status: lead.status,
    tags: lead.tags,
    assignedTo: lead.assignedTo,
    createdAt: lead.createdAt,
    lastContactedAt: lead.lastContactedAt,
  };
};
