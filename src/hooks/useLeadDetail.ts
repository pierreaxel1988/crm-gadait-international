import { useState, useCallback, useEffect } from 'react';
import { LeadDetailed } from '@/types/lead';
import { ActionHistory } from '@/types/actionHistory';
import { getLead, updateLead } from '@/services/leadService';
import { toast } from '@/hooks/use-toast';

// Important UUIDs
const JADE_ID = "acab847b-7ace-4681-989d-86f78549aa69";
const JEAN_MARC_ID = "af8e053c-8fae-4424-abaa-d79029fd8a11";
const JACQUES_ID = "e59037a6-218d-4504-a3ad-d2c399784dc7";

export function useLeadDetail(id: string | undefined) {
  const [lead, setLead] = useState<LeadDetailed | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [isCallTracking, setIsCallTracking] = useState(false);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [callType, setCallType] = useState<'phone' | 'whatsapp'>('phone');
  const [isSilentSave, setIsSilentSave] = useState(false);
  const [hasShownPendingActionsToast, setHasShownPendingActionsToast] = useState(false);

  const fetchLead = useCallback(async () => {
    if (id) {
      try {
        const leadData = await getLead(id);
        console.log("Fetched lead data:", leadData);
        
        if (leadData) {
          // Ensure Jade's and Jean Marc's IDs are properly formatted
          if (leadData.assignedTo === 'jade-diouane') {
            leadData.assignedTo = JADE_ID;
            console.log("Converted legacy Jade ID to UUID in useLeadDetail:", JADE_ID);
          } else if (leadData.assignedTo === 'jean-marc-perrissol') {
            leadData.assignedTo = JEAN_MARC_ID;
            console.log("Converted legacy Jean Marc ID to UUID in useLeadDetail:", JEAN_MARC_ID);
          }
          
          setLead(leadData);
        } else {
          setLead(undefined);
        }
        
        setHasChanges(false);
      } catch (error) {
        console.error("Error fetching lead:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les informations du lead."
        });
      } finally {
        setIsLoading(false);
      }
    }
  }, [id]);
  
  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  const handleSave = async (silent = false) => {
    if (!lead) return;
    
    try {
      setIsSaving(true);
      console.log("Saving lead data:", lead);
      
      // Ensure agent IDs are in the correct format before saving
      const updatedLeadData = { ...lead };
      if (updatedLeadData.assignedTo === 'jade-diouane') {
        updatedLeadData.assignedTo = JADE_ID;
        console.log("Converting 'jade-diouane' to proper UUID before save:", JADE_ID);
      } else if (updatedLeadData.assignedTo === 'jean-marc-perrissol') {
        updatedLeadData.assignedTo = JEAN_MARC_ID;
        console.log("Converting 'jean-marc-perrissol' to proper UUID before save:", JEAN_MARC_ID);
      }
      
      console.log("Saving lead with all owner fields:", {
        propertyType: updatedLeadData.propertyType,
        mandate_type: updatedLeadData.mandate_type,
        desired_price: updatedLeadData.desired_price,
        fees: updatedLeadData.fees,
        relationship_status: updatedLeadData.relationship_status,
        specific_needs: updatedLeadData.specific_needs,
        attention_points: updatedLeadData.attention_points,
        relationship_details: updatedLeadData.relationship_details,
        google_drive_link: updatedLeadData.google_drive_link,
        map_coordinates: updatedLeadData.mapCoordinates,
        furnished: updatedLeadData.furnished,
        furniture_included_in_price: updatedLeadData.furniture_included_in_price,
        furniture_price: updatedLeadData.furniture_price
      });
      
      // Ensure all required fields are properly set for owners
      if (updatedLeadData.pipelineType === 'owners') {
        console.log("Saving owner lead with propertyType:", updatedLeadData.propertyType);
        
        // Ensure other owner-specific fields are handled
        if (!updatedLeadData.relationship_status) {
          updatedLeadData.relationship_status = 'Nouveau contact';
        }
      }
      
      // Use updateLead for all lead types including owners
      const updatedLead = await updateLead({
        ...updatedLeadData,
        phoneCountryCode: updatedLeadData.phoneCountryCode || '+33',
        phoneCountryCodeDisplay: updatedLeadData.phoneCountryCodeDisplay || '🇫🇷',
        preferredLanguage: updatedLeadData.preferredLanguage || null,
        mandate_type: updatedLeadData.mandate_type,
        mapCoordinates: updatedLeadData.mapCoordinates || null
      });
      
      if (updatedLead) {
        if (!silent) {
          toast({
            title: lead.pipelineType === 'owners' ? "Propriétaire mis à jour" : "Lead mis à jour",
            description: "Les modifications ont été enregistrées avec succès."
          });
        }
        
        console.log("Lead saved successfully with all fields:", updatedLead);
        setLead(updatedLead);
        setHasChanges(false);
      }
    } catch (error) {
      console.error("Error saving:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible d'enregistrer les modifications: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (hasChanges && autoSaveEnabled && lead) {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      const timer = setTimeout(() => {
        console.log("Auto-saving changes for lead:", lead.name);
        console.log("Current lead data before auto-save:", {
          propertyType: lead.propertyType,
          mandate_type: lead.mandate_type,
          desired_price: lead.desired_price,
          fees: lead.fees,
          relationship_status: lead.relationship_status,
          google_drive_link: lead.google_drive_link,
          mapCoordinates: lead.mapCoordinates
        });
        handleSave(true);
      }, 1500); // Reduced timeout for faster auto-save
      
      setAutoSaveTimer(timer);
    }
    
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [lead, hasChanges, autoSaveEnabled]);

  const handleDataChange = (data: Partial<LeadDetailed>) => {
    if (!lead) return;
    
    console.log("📝 Updating lead data:", data);
    
    // Special logging for buyer criteria fields
    if (data.propertyTypes !== undefined) {
      console.log("🏠 PropertyTypes change detected:", {
        oldValue: lead.propertyTypes,
        newValue: data.propertyTypes
      });
    }
    
    if (data.bedrooms !== undefined) {
      console.log("🛏️ Bedrooms change detected:", {
        oldValue: lead.bedrooms,
        newValue: data.bedrooms
      });
    }
    
    if (data.views !== undefined) {
      console.log("👀 Views change detected:", {
        oldValue: lead.views,
        newValue: data.views
      });
    }
    
    if (data.amenities !== undefined) {
      console.log("⭐ Amenities change detected:", {
        oldValue: lead.amenities,
        newValue: data.amenities
      });
    }
    
    // Special logging for important owner fields
    if (data.propertyType !== undefined) {
      console.log("PropertyType change detected:", {
        oldValue: lead.propertyType,
        newValue: data.propertyType
      });
    }
    
    if (data.mandate_type !== undefined) {
      console.log("Mandate type change detected:", {
        oldValue: lead.mandate_type,
        newValue: data.mandate_type
      });
    }

    if (data.desired_price !== undefined) {
      console.log("Desired price change detected:", {
        oldValue: lead.desired_price,
        newValue: data.desired_price
      });
    }

    if (data.fees !== undefined) {
      console.log("Fees change detected:", {
        oldValue: lead.fees,
        newValue: data.fees
      });
    }

    if (data.google_drive_link !== undefined) {
      console.log("Google Drive link change detected:", {
        oldValue: lead.google_drive_link,
        newValue: data.google_drive_link
      });
    }

    if (data.mapCoordinates !== undefined) {
      console.log("Map coordinates change detected:", {
        oldValue: lead.mapCoordinates,
        newValue: data.mapCoordinates
      });
    }
    
    // Check for agent ID conversions
    if (data.assignedTo === 'jade-diouane') {
      data.assignedTo = JADE_ID;
      console.log("Converting 'jade-diouane' to proper UUID in handleDataChange:", JADE_ID);
    } else if (data.assignedTo === 'jean-marc-perrissol') {
      data.assignedTo = JEAN_MARC_ID;
      console.log("Converting 'jean-marc-perrissol' to proper UUID in handleDataChange:", JEAN_MARC_ID);
    }
    
    setLead(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      
      console.log("Updated lead state:", {
        propertyType: updated.propertyType,
        mandate_type: updated.mandate_type,
        desired_price: updated.desired_price,
        fees: updated.fees,
        relationship_status: updated.relationship_status,
        google_drive_link: updated.google_drive_link,
        mapCoordinates: updated.mapCoordinates
      });
      
      return updated;
    });
    
    setHasChanges(true);
  };

  const getFormattedPhoneForCall = () => {
    if (!lead?.phone) return '';
    
    const countryCode = lead.phoneCountryCode || '+33';
    const phoneNumber = lead.phone.startsWith('+') 
      ? lead.phone.substring(1)
      : lead.phone.startsWith('0') 
        ? lead.phone.substring(1)
        : lead.phone;
    
    return `${countryCode}${phoneNumber}`;
  };

  const getFormattedPhoneForWhatsApp = () => {
    if (!lead?.phone) return '';
    
    const fullPhone = getFormattedPhoneForCall();
    
    return fullPhone.replace(/\D/g, '');
  };

  const startCallTracking = (type: 'phone' | 'whatsapp' = 'phone') => {
    setIsCallTracking(true);
    setCallStartTime(new Date());
    setCallType(type);
  };

  const endCallTracking = (callDuration: number) => {
    if (!lead || !isCallTracking) return;
    
    const callAction: ActionHistory = {
      id: crypto.randomUUID(),
      actionType: 'Call',
      notes: `${callType === 'whatsapp' ? 'WhatsApp' : 'Appel'} de ${formatDuration(callDuration)}`,
      createdAt: callStartTime?.toISOString() || new Date().toISOString(),
      scheduledDate: callStartTime?.toISOString() || new Date().toISOString(),
      completedDate: new Date().toISOString()
    };
    
    handleDataChange({
      actionHistory: [...(lead.actionHistory || []), callAction],
      lastContactedAt: new Date().toISOString()
    });
    
    setIsCallTracking(false);
    setCallStartTime(null);
    
    toast({
      title: callType === 'whatsapp' ? "WhatsApp enregistré" : "Appel enregistré",
      description: `Un ${callType === 'whatsapp' ? 'appel WhatsApp' : 'appel'} de ${formatDuration(callDuration)} a été enregistré.`
    });
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    if (lead?.actionHistory) {
      const now = new Date();
      const pendingActions = lead.actionHistory.filter(action => {
        if (action.completedDate) return false;
        if (!action.scheduledDate) return false;
        
        const scheduledDate = new Date(action.scheduledDate);
        return scheduledDate >= now || scheduledDate < now;
      });

      const pendingActionsCount = pendingActions.length;
      
      // Notification supprimée - plus besoin d'alerter sur les actions en attente
    }
  }, [lead?.actionHistory, hasShownPendingActionsToast]);

  const handleReassignToJacques = async () => {
    if (!lead) return;

    const jacquesId = JACQUES_ID;
      
    try {
      const updatedLead = await updateLead({
        ...lead,
        assignedTo: jacquesId
      });
      
      if (updatedLead) {
        setLead(updatedLead);
        toast({
          title: "Lead réassigné",
          description: "Le lead a été réassigné à Jacques avec succès."
        });
      }
    } catch (error) {
      console.error("Error reassigning lead:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de réassigner le lead à Jacques."
      });
    }
  };

  return {
    lead,
    setLead,
    isLoading,
    isSaving,
    hasChanges,
    autoSaveEnabled,
    setAutoSaveEnabled,
    handleSave,
    handleDataChange,
    fetchLead,
    getFormattedPhoneForCall: lead?.phone ? () => {
      const countryCode = lead.phoneCountryCode || '+33';
      const phoneNumber = lead.phone.startsWith('+') 
        ? lead.phone.substring(1)
        : lead.phone.startsWith('0') 
          ? lead.phone.substring(1)
          : lead.phone;
      
      return `${countryCode}${phoneNumber}`;
    } : () => '',
    getFormattedPhoneForWhatsApp: lead?.phone ? () => {
      const fullPhone = (() => {
        const countryCode = lead.phoneCountryCode || '+33';
        const phoneNumber = lead.phone.startsWith('+') 
          ? lead.phone.substring(1)
          : lead.phone.startsWith('0') 
            ? lead.phone.substring(1)
            : lead.phone;
        
        return `${countryCode}${phoneNumber}`;
      })();
      
      return fullPhone.replace(/\D/g, '');
    } : () => '',
    startCallTracking,
    endCallTracking,
    formatDuration,
    handleReassignToJacques
  };
}
