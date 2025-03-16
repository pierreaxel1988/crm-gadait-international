import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { createLead } from '@/services/leadService';
import { LeadDetailed } from '@/types/lead';
import { ExtractedData, TeamMember, PropertyDetails } from '../types/chatTypes';
import { useNavigate } from 'react-router-dom';

export const useEmailExtraction = () => {
  const [emailContent, setEmailContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [selectedPipeline, setSelectedPipeline] = useState<'purchase' | 'rental'>('purchase');
  const [selectedAgent, setSelectedAgent] = useState<string | undefined>(undefined);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('id, name')
          .order('name');

        if (error) {
          console.error('Error fetching team members:', error);
          return;
        }

        if (data) {
          setTeamMembers(data);
        }
      } catch (error) {
        console.error('Unexpected error fetching team members:', error);
      }
    };

    fetchTeamMembers();
  }, []);

  const extractEmailData = async () => {
    if (!emailContent.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez coller le contenu d'un email."
      });
      return;
    }

    setIsLoading(true);
    try {
      // First, pre-process the email to extract property details if it's a Le Figaro email
      let propertyDetails: PropertyDetails = {};
      
      // Check if it's a Le Figaro email
      if (emailContent.includes('Propriétés Le Figaro')) {
        propertyDetails = extractLefigaroPropertyDetails(emailContent);
      }
      
      // Now proceed with the AI extraction, adding the property details we've extracted
      const { data, error } = await supabase.functions.invoke('chat-gadait', {
        body: { 
          type: 'email-extract', 
          content: emailContent,
          propertyDetails
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      try {
        const jsonData = JSON.parse(data.response);
        
        // Merge any property details we extracted with the AI response
        if (propertyDetails && Object.keys(propertyDetails).length > 0) {
          Object.keys(propertyDetails).forEach(key => {
            if (propertyDetails[key] && !jsonData[key]) {
              jsonData[key] = propertyDetails[key];
            }
          });
        }
        
        setExtractedData(jsonData);
        // Show assignment form after successful extraction
        setShowAssignmentForm(true);
        
        toast({
          title: "Données extraites",
          description: "Les informations ont été extraites avec succès."
        });
      } catch (parseError) {
        setExtractedData({ raw: data.response });
        toast({
          variant: "destructive",
          title: "Format incorrect",
          description: "Les données n'ont pas pu être traitées correctement."
        });
      }
    } catch (error) {
      console.error('Error extracting email data:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'extraire les données de l'email."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createLeadFromData = () => {
    if (!extractedData) return;
    
    if (!selectedAgent) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un commercial à qui assigner ce lead."
      });
      return;
    }
    
    try {
      const newLead: Omit<LeadDetailed, "id" | "createdAt"> = {
        name: extractedData.Name || extractedData.name || "",
        email: extractedData.Email || extractedData.email || "",
        phone: extractedData.Phone || extractedData.phone || "",
        source: extractedData.Source || extractedData.source || "Site web",
        budget: extractedData.Budget || extractedData.budget || "",
        propertyReference: extractedData.property_reference || extractedData.reference || extractedData["Property reference"] || "",
        desiredLocation: extractedData.desired_location || extractedData.desiredLocation || extractedData["Desired location"] || "",
        propertyType: extractedData.property_type || extractedData.propertyType || extractedData["Property type"] || "",
        notes: emailContent || "",
        status: "New",
        tags: ["Imported"],
        assignedTo: selectedAgent,
        taskType: "Call", // Always assign "Call" task regardless of pipeline
      };
      
      const createdLead = createLead(newLead);
      
      toast({
        title: "Lead créé",
        description: `Le lead ${newLead.name} a été créé avec succès dans le pipeline ${selectedPipeline === 'purchase' ? 'achat' : 'location'}.`
      });
      
      setEmailContent("");
      setExtractedData(null);
      setSelectedAgent(undefined);
      setShowAssignmentForm(false);
      
      // Navigate to the lead detail page
      if (createdLead && createdLead.id) {
        setTimeout(() => {
          navigate(`/leads/${createdLead.id}`);
        }, 500);
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le lead."
      });
    }
  };

  const extractLefigaroPropertyDetails = (emailText: string): PropertyDetails => {
    const details: PropertyDetails = {};
    
    // Extract property reference
    const refMatch = emailText.match(/Votre Référence\s*:\s*([^-\r\n]+)/i);
    if (refMatch && refMatch[1]) {
      details.reference = refMatch[1].trim();
    }
    
    // Extract property URL
    const urlMatch = emailText.match(/Annonce concernée\s*:\s*(https?:\/\/[^\s\r\n]+)/i);
    if (urlMatch && urlMatch[1]) {
      details.url = urlMatch[1].trim();
      
      // Extract info from URL
      const urlPath = new URL(details.url).pathname;
      const pathParts = urlPath.split('/');
      
      // Extract property type from URL if available
      if (pathParts.length > 1) {
        const typeLocationPart = pathParts[2] || '';
        const typeMatch = typeLocationPart.match(/^([^-]+)/);
        if (typeMatch && typeMatch[1]) {
          details.type = typeMatch[1].replace(/-/g, ' ').trim();
        }
      }
      
      // Extract country from URL if available
      if (pathParts.length > 2) {
        const countryPart = pathParts[pathParts.length - 2] || '';
        if (countryPart) {
          details.country = countryPart.replace(/-/g, ' ').trim();
        }
      }
    }
    
    // Extract property details from the listing block
    const propertyDetailsMatch = emailText.match(/Vente\s+([^\n]+)\s+([^\n]+)\s+Prix\s*:\s*([^\n]+)\s+(\d+)\s*m²/i);
    if (propertyDetailsMatch) {
      details.type = propertyDetailsMatch[1]?.trim() || details.type;
      details.location = propertyDetailsMatch[2]?.trim() || details.location;
      details.price = propertyDetailsMatch[3]?.trim() || details.price;
      details.area = propertyDetailsMatch[4] ? `${propertyDetailsMatch[4].trim()} m²` : details.area;
    }
    
    // Extract property description
    const descriptionMatch = emailText.match(/Gadait International vous présente[\s\S]+?(?=\s*---)/i);
    if (descriptionMatch && descriptionMatch[0]) {
      details.description = descriptionMatch[0].trim();
    }
    
    // Extract client information
    const nameMatch = emailText.match(/•\s*Nom\s*:\s*([^\r\n]+)/i);
    if (nameMatch && nameMatch[1]) {
      details['name'] = nameMatch[1].trim();
    }
    
    const emailMatch = emailText.match(/•\s*Email\s*:\s*([^\r\n]+)/i);
    if (emailMatch && emailMatch[1]) {
      details['email'] = emailMatch[1].trim();
    }
    
    const phoneMatch = emailText.match(/•\s*Téléphone\s*:\s*([^\r\n]+)/i);
    if (phoneMatch && phoneMatch[1]) {
      details['phone'] = phoneMatch[1].trim();
    }
    
    const countryMatch = emailText.match(/•\s*Pays\s*:\s*([^\r\n]+)/i);
    if (countryMatch && countryMatch[1]) {
      details['country'] = countryMatch[1].trim();
    }
    
    // Extract budget
    const budgetMatch = emailText.match(/•\s*de\s*([0-9\s]+)\s*à\s*([0-9\s]+)\s*(\$|€)/i);
    if (budgetMatch) {
      const min = budgetMatch[1].replace(/\s/g, '');
      const max = budgetMatch[2].replace(/\s/g, '');
      const currency = budgetMatch[3];
      details['budget'] = `${min} - ${max} ${currency}`;
    }
    
    // Extract location
    const locationMatch = emailText.match(/•\s*([^•\r\n]+)\s*\(([^)]+)\)/i);
    if (locationMatch) {
      details['desiredLocation'] = locationMatch[1].trim();
      if (!details['country']) {
        details['country'] = locationMatch[2].trim();
      }
    }
    
    // Extract property type
    const propertyTypeMatch = emailText.match(/•\s*([^•\r\n:]+?)(?=\s*\n|•\s*de|$)/i);
    if (propertyTypeMatch && propertyTypeMatch[1] && !propertyTypeMatch[1].includes('Propriétés Le Figaro')) {
      details['propertyType'] = propertyTypeMatch[1].trim();
    }
    
    return details;
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
