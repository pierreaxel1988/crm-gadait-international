
import { supabase } from "@/integrations/supabase/client";

// Important IDs to never forget
const JACQUES_ID = "e59037a6-218d-4504-a3ad-d2c399784dc7";
const PIERRE_AXEL_ID = "ccbc635f-0282-427b-b130-82c1f0fbbdf9"; // Corrected UUID
const JADE_ID = "acab847b-7ace-4681-989d-86f78549aa69";
const JEAN_MARC_ID = "af8e053c-8fae-4424-abaa-d79029fd8a11";
const SHARON_ID = "e564a874-2520-4167-bfa8-26d39f119470";
const CHRISTELLE_ID = "06e60e2c-4835-4d19-bdf1-5d06f5d2b7e9";
const CHLOE_ID = "28c03acf-cb78-46b7-8dba-c1edee49c932";
const CHRISTINE_ID = "af1c9117-f94f-44d0-921f-776dd5fd6f96";
const OPHELIE_ID = "2d8bae00-a935-439d-8685-0adf238a612e";

// Liste complète des membres garantis avec leur ID officiel
export const GUARANTEED_TEAM_MEMBERS = [
  { id: JACQUES_ID, name: "Jacques Charles", email: "jacques@gadait-international.com", role: "agent" },
  { id: PIERRE_AXEL_ID, name: "Pierre-Axel Gadait", email: "pierre@gadait-international.com", role: "admin" },
  { id: JADE_ID, name: "Jade Diouane", email: "jade@gadait-international.com", role: "agent" },
  { id: JEAN_MARC_ID, name: "Jean Marc Perrissol", email: "jeanmarc@gadait-international.com", role: "agent" },
  { id: SHARON_ID, name: "Sharon Ramdiane", email: "sharon@gadait-international.com", role: "agent" },
  { id: CHRISTELLE_ID, name: "Christelle Gadait", email: "christelle@gadait-international.com", role: "admin" },
  { id: CHLOE_ID, name: "Chloe Valentin", email: "chloe@gadait-international.com", role: "admin" },
  { id: CHRISTINE_ID, name: "Christine Francoise", email: "admin@gadait-international.com", role: "admin" },
  { id: OPHELIE_ID, name: "Ophelie Durand", email: "ophelie@gadait-international.com", role: "agent" }
];

// Anciennes clés utilisées pour les agents, à remplacer par les UUIDs corrects
const LEGACY_KEYS_MAP: Record<string, string> = {
  'jade': JADE_ID,
  'jade-diouane': JADE_ID,
  'jean-marc': JEAN_MARC_ID,
  'jean-marc-perrissol': JEAN_MARC_ID,
  'sharon': SHARON_ID,
  'sharon-ramdiane': SHARON_ID,
  'jacques': JACQUES_ID,
  'jacques-charles': JACQUES_ID,
  'pierre': PIERRE_AXEL_ID,
  'pierre-axel': PIERRE_AXEL_ID,
  'ophelie': OPHELIE_ID,
  'ophelie-durand': OPHELIE_ID
};

/**
 * Vérifie et corrige les assignations de leads dans la base de données
 * en remplaçant les anciennes clés par les UUIDs corrects
 */
export const synchronizeLeadAssignments = async (): Promise<{
  success: boolean;
  corrected: number;
  errors: string[];
}> => {
  const errors: string[] = [];
  let correctedCount = 0;
  
  try {
    console.log("Démarrage de la synchronisation des assignations de leads...");
    
    // Récupérer tous les leads qui ont une assignation
    const { data: leads, error: fetchError } = await supabase
      .from('leads')
      .select('id, assigned_to')
      .not('assigned_to', 'is', null);
    
    if (fetchError) {
      throw fetchError;
    }
    
    // Vérifier les leads qui pourraient avoir des anciennes clés
    const leadsToUpdate = leads?.filter(lead => {
      // Vérifier si l'assigned_to n'est pas un UUID valide
      const isValidUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
        .test(lead.assigned_to);
      
      // Ou si c'est une ancienne clé qui doit être remplacée
      const isLegacyKey = Object.keys(LEGACY_KEYS_MAP).includes(lead.assigned_to);
      
      return !isValidUUID || isLegacyKey;
    });
    
    console.log(`${leadsToUpdate?.length || 0} leads à mettre à jour avec des UUIDs corrects`);
    
    // Mettre à jour les leads avec des UUIDs incorrects
    const updatePromises = leadsToUpdate?.map(async (lead) => {
      const correctUUID = LEGACY_KEYS_MAP[lead.assigned_to];
      
      if (correctUUID) {
        const { error: updateError } = await supabase
          .from('leads')
          .update({ assigned_to: correctUUID })
          .eq('id', lead.id);
        
        if (updateError) {
          errors.push(`Erreur lors de la mise à jour du lead ${lead.id}: ${updateError.message}`);
          return false;
        }
        
        console.log(`Lead ${lead.id}: assigné de "${lead.assigned_to}" à "${correctUUID}"`);
        return true;
      }
      
      errors.push(`Pas d'UUID correspondant trouvé pour le lead ${lead.id} avec assigned_to=${lead.assigned_to}`);
      return false;
    }) || [];
    
    const results = await Promise.all(updatePromises);
    correctedCount = results.filter(Boolean).length;
    
    // Synchroniser la table team_members avec les membres garantis
    await synchronizeTeamMembers();
    
    return {
      success: true,
      corrected: correctedCount,
      errors
    };
  } catch (error) {
    console.error("Erreur lors de la synchronisation des assignations:", error);
    errors.push(`Erreur générale: ${error.message}`);
    
    return {
      success: false,
      corrected: correctedCount,
      errors
    };
  }
};

/**
 * Synchronise la table team_members avec les membres garantis
 */
const synchronizeTeamMembers = async (): Promise<void> => {
  try {
    console.log("Synchronisation de la table team_members...");
    
    // Récupérer tous les membres d'équipe existants
    const { data: existingMembers, error: fetchError } = await supabase
      .from('team_members')
      .select('id, name, email, role');
    
    if (fetchError) {
      throw fetchError;
    }
    
    // Pour chaque membre garanti, vérifier s'il existe déjà
    for (const member of GUARANTEED_TEAM_MEMBERS) {
      const exists = existingMembers?.some(m => m.id === member.id);
      
      if (!exists) {
        // S'il n'existe pas, l'ajouter
        const { error: insertError } = await supabase
          .from('team_members')
          .insert({
            id: member.id,
            name: member.name,
            email: member.email,
            role: member.role,
            is_admin: member.role === 'admin'
          });
        
        if (insertError) {
          console.error(`Erreur lors de l'ajout du membre ${member.name}:`, insertError);
        } else {
          console.log(`Membre ajouté: ${member.name} (${member.id})`);
        }
      }
    }
    
    console.log("Synchronisation des membres d'équipe terminée");
  } catch (error) {
    console.error("Erreur lors de la synchronisation des membres d'équipe:", error);
  }
};

// Nouvelle fonction pour obtenir les agents garantis
export const getGuaranteedAgents = () => {
  return GUARANTEED_TEAM_MEMBERS.sort((a, b) => a.name.localeCompare(b.name));
};
