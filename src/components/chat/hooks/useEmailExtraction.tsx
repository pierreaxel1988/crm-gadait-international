
import { useEmailDataExtraction } from './useEmailDataExtraction';
import { useTeamMembers } from './useTeamMembers';
import { useLeadCreation } from './useLeadCreation';

export const useEmailExtraction = () => {
  const {
    emailContent,
    setEmailContent,
    isLoading,
    extractedData,
    extractEmailData: extractData,
    resetEmailExtraction
  } = useEmailDataExtraction();
  
  const {
    teamMembers
  } = useTeamMembers();
  
  const {
    selectedPipeline,
    setSelectedPipeline,
    selectedAgent,
    setSelectedAgent,
    showAssignmentForm,
    setShowAssignmentForm,
    createLeadFromData: createLead
  } = useLeadCreation();
  
  // Custom extraction that also shows the assignment form
  const extractEmailData = async () => {
    await extractData();
    setShowAssignmentForm(true);
  };
  
  // Wrapper around createLead that passes the correct data and resets the form
  const createLeadFromData = () => {
    createLead(extractedData, emailContent, () => {
      resetEmailExtraction();
      setSelectedAgent(undefined);
      setShowAssignmentForm(false);
    });
  };
  
  return {
    emailContent,
    setEmailContent,
    isLoading,
    extractedData,
    selectedPipeline,
    setSelectedPipeline,
    selectedAgent,
    setSelectedAgent,
    teamMembers,
    extractEmailData,
    createLeadFromData,
    showAssignmentForm,
    setShowAssignmentForm
  };
};
