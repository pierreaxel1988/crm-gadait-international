
import type { LeadDetailed } from "@/types/lead";

// Re-export all the functions from our new files
export { getLeads, getLead } from "./leadReader";
export { createLead } from "./leadCreator";
export { updateLead, deleteLead } from "./leadUpdater";
export { convertToSimpleLead } from "./utils/leadMappers";

// Export a type-only reference to the LeadDetailed interface for convenience
export type { LeadDetailed };
