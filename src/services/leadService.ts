
import type { LeadDetailed } from "@/types/lead";
// Change export to export type
export type { ActionHistory } from "@/types/actionHistory";

// Re-export everything from the split files
export { 
  getLeads, 
  getLead, 
  updateLead, 
  createLead, 
  deleteLead,
  convertToSimpleLead 
} from "./leadCore";
export { addActionToLead } from "./leadActions";

// Also export the LeadDetailed type for convenience
export type { LeadDetailed };
