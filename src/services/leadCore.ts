
import type { LeadDetailed } from "@/types/lead";

// Re-export all the functions from our new files
export { getLeads, getLead, convertToSimpleLead } from "./leadReader";
export { createLead } from "./leadCreator";
export { updateLead, deleteLead } from "./leadUpdater";

// Export a type-only reference to the LeadDetailed interface for convenience
export type { LeadDetailed };
