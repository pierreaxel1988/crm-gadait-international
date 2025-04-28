
import { supabase } from "@/integrations/supabase/client";
import { MOCK_USERS } from "@/components/admin/types/userTypes";

// Liste des IDs garantis pour les membres de l'équipe
// Utilisée comme source de vérité pour les opérations importantes
export const JADE_ID = "acab847b-7ace-4681-989d-86f78549aa69";
export const JEAN_MARC_ID = "af8e053c-8fae-4424-abaa-d79029fd8a11";
export const SHARON_ID = "e564a874-2520-4167-bfa8-26d39f119470";
export const PIERRE_AXEL_ID = "8857c5c7-f331-43e0-86e6-7b1d79ed4a42";
export const CHRISTELLE_ID = "e408c5e8-f264-42da-9f9b-5fb8e16d84c9";
export const ADMIN_ID = "45df44f5-72c8-4b2a-b6f1-35ca9d92d59d";
export const CHLOE_ID = "22ce5f2a-1cc4-4b5a-bec4-a630c5a9e76d";
export const OPHELIE_ID = "c5dc51ac-449a-4e6d-9e9a-aab1bbef3999";
export const JACQUES_ID = "d4c4c8eb-3a0f-450d-b69e-e597c6cad885";

// Liste garantie des membres de l'équipe avec leurs ID corrects
export const GUARANTEED_TEAM_MEMBERS = [
  { id: PIERRE_AXEL_ID, name: "Pierre-Axel Gadait", email: "pierre@gadait-international.com", is_admin: true, role: 'admin' },
  { id: CHRISTELLE_ID, name: "Christelle Gadait", email: "christelle@gadait-international.com", is_admin: true, role: 'admin' },
  { id: ADMIN_ID, name: "Admin", email: "admin@gadait-international.com", is_admin: true, role: 'admin' },
  { id: CHLOE_ID, name: "Chloé Valentin", email: "chloe@gadait-international.com", is_admin: true, role: 'admin' },
  { id: JADE_ID, name: "Jade Diouane", email: "jade@gadait-international.com", is_admin: false, role: 'commercial' },
  { id: OPHELIE_ID, name: "Ophelie Durand", email: "ophelie@gadait-international.com", is_admin: false, role: 'commercial' },
  { id: JEAN_MARC_ID, name: "Jean Marc Perrissol", email: "jeanmarc@gadait-international.com", is_admin: false, role: 'commercial' },
  { id: JACQUES_ID, name: "Jacques Charles", email: "jacques@gadait-international.com", is_admin: false, role: 'commercial' },
  { id: SHARON_ID, name: "Sharon Ramdiane", email: "sharon@gadait-international.com", is_admin: false, role: 'commercial' },
];

/**
 * Récupère le nom d'un membre de l'équipe à partir de son ID
 * @param id ID du membre
 * @returns Le nom du membre ou "Inconnu" si non trouvé
 */
export const getTeamMemberName = (id: string): string => {
  if (!id) return "Non assigné";
  
  const teamMember = GUARANTEED_TEAM_MEMBERS.find(member => member.id === id);
  return teamMember ? teamMember.name : "Inconnu";
};

/**
 * Récupère les informations complètes d'un membre de l'équipe à partir de son ID
 * @param id ID du membre
 * @returns L'objet complet du membre ou null si non trouvé
 */
export const getTeamMemberById = (id: string) => {
  if (!id) return null;
  
  return GUARANTEED_TEAM_MEMBERS.find(member => member.id === id) || null;
};

/**
 * Récupère l'ID d'un membre de l'équipe à partir de son email
 * @param email Email du membre
 * @returns L'ID du membre ou null si non trouvé
 */
export const getTeamMemberId = (email: string | undefined): string | null => {
  if (!email) return null;
  
  const member = GUARANTEED_TEAM_MEMBERS.find(m => m.email === email);
  return member ? member.id : null;
};

/**
 * Récupère tous les membres de l'équipe depuis la base de données
 * @returns La liste des membres de l'équipe
 */
export const getAllTeamMembers = async () => {
  try {
    const { data, error } = await supabase.from('team_members').select('*');
    
    if (error) {
      console.error("Erreur lors de la récupération des membres de l'équipe:", error);
      // Fallback sur la liste garantie
      return GUARANTEED_TEAM_MEMBERS;
    }
    
    return data;
  } catch (error) {
    console.error("Exception lors de la récupération des membres de l'équipe:", error);
    // Fallback sur la liste garantie
    return GUARANTEED_TEAM_MEMBERS;
  }
};

/**
 * Synchronise les assignations de leads pour corriger les ID des agents
 * @returns Un objet indiquant le succès de l'opération
 */
export const synchronizeLeadAssignments = async () => {
  try {
    console.log("Démarrage de la synchronisation des assignations de leads...");
    
    // Structure de mappage: ancien format -> UUID correct
    const agentMappings = [
      { oldValues: ["jade", "jade-diouane"], correctId: JADE_ID },
      { oldValues: ["jean-marc", "jean-marc-perrissol"], correctId: JEAN_MARC_ID },
      { oldValues: ["sharon", "sharon-ramdiane"], correctId: SHARON_ID },
      { oldValues: ["pierre", "pierre-gadait"], correctId: PIERRE_AXEL_ID },
      { oldValues: ["christelle", "christelle-gadait"], correctId: CHRISTELLE_ID },
      { oldValues: ["admin"], correctId: ADMIN_ID },
      { oldValues: ["chloe", "chloe-gadait"], correctId: CHLOE_ID },
      { oldValues: ["ophelie", "ophelie-durand"], correctId: OPHELIE_ID },
      { oldValues: ["jacques", "jacques-charles"], correctId: JACQUES_ID }
    ];
    
    // Pour chaque mapping, effectuer une mise à jour directe
    for (const mapping of agentMappings) {
      if (mapping.oldValues.length > 0) {
        console.log(`Correction des assignations pour ${mapping.oldValues.join(", ")} vers ${mapping.correctId}`);
        
        // Utiliser une approche directe avec une requête SQL via la requête UPDATE
        for (const oldValue of mapping.oldValues) {
          const { error: updateError } = await supabase
            .from('leads')
            .update({ assigned_to: mapping.correctId })
            .eq('assigned_to', oldValue);
            
          if (updateError) {
            console.error(`Erreur lors de la mise à jour pour ${oldValue}:`, updateError);
          } else {
            console.log(`Mise à jour réussie pour ${oldValue} -> ${mapping.correctId}`);
          }
        }
      }
    }
    
    console.log("Synchronisation des assignations de leads terminée avec succès");
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la synchronisation des assignations de leads:', error);
    throw error;
  }
};
