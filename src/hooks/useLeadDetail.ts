
import { useState, useCallback, useEffect } from 'react';
import { LeadDetailed } from '@/types/lead';
import { ActionHistory } from '@/types/actionHistory';
import { getLead, updateLead } from '@/services/leadService';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Important UUIDs
const JADE_ID = "acab847b-7ace-4681-989d-86f78549aa69";
const JEAN_MARC_ID = "af8e053c-8fae-4424-abaa-d79029fd8a11";
const JACQUES_ID = "e59037a6-218d-4504-a3ad-d2c399784dc7";

export function useLeadDetail(id: string | undefined) {
  const [lead, setLead] = useState<LeadDetailed | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
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
        setIsLoading(true);
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
      
      // Pour les propriétaires, sauvegarder UNIQUEMENT dans la table owners
      if (lead.pipelineType === 'owners') {
        const ownerUpdates = {
          full_name: updatedLeadData.name,
          email: updatedLeadData.email,
          phone: updatedLeadData.phone,
          nationality: updatedLeadData.nationality,
          preferred_language: updatedLeadData.preferredLanguage,
          assigned_to: updatedLeadData.assignedTo,
          last_contacted_at: updatedLeadData.lastContactedAt,
          source: updatedLeadData.source,
          property_reference: updatedLeadData.propertyReference,
          url: updatedLeadData.url,
          tags: updatedLeadData.tags,
          regions: updatedLeadData.regions,
          notes: updatedLeadData.notes,
          internal_notes: updatedLeadData.internal_notes,
          action_history: updatedLeadData.actionHistory,
          task_type: updatedLeadData.taskType,
          next_follow_up_date: updatedLeadData.nextFollowUpDate,
          salutation: updatedLeadData.salutation,
          integration_source: updatedLeadData.integration_source,
          imported_at: updatedLeadData.imported_at,
          external_id: updatedLeadData.external_id,
          // Synchronize additional owner fields
          desired_price: updatedLeadData.desired_price,
          fees: updatedLeadData.fees,
          currency: updatedLeadData.currency,
          country: updatedLeadData.country,
          location: updatedLeadData.location,
          desired_location: updatedLeadData.desiredLocation,
          map_coordinates: updatedLeadData.mapCoordinates,
          property_type: updatedLeadData.propertyType,
          bedrooms: Array.isArray(updatedLeadData.bedrooms) ? updatedLeadData.bedrooms[0] : updatedLeadData.bedrooms,
          bathrooms: updatedLeadData.bathrooms,
          living_area: updatedLeadData.livingArea,
          land_area: updatedLeadData.landArea,
          construction_year: updatedLeadData.constructionYear,
          property_state: updatedLeadData.propertyState,
          property_description: updatedLeadData.propertyDescription,
          assets: updatedLeadData.assets,
          equipment: updatedLeadData.equipment,
          furnished: updatedLeadData.furnished,
          furniture_included_in_price: updatedLeadData.furniture_included_in_price,
          furniture_price: updatedLeadData.furniture_price,
          status: updatedLeadData.status,
          specific_needs: updatedLeadData.specific_needs,
          attention_points: updatedLeadData.attention_points,
          relationship_details: updatedLeadData.relationship_details,
          // Nouveaux champs d'optimisation
          is_furniture_relevant: updatedLeadData.is_furniture_relevant,
          price_validation_status: 'pending',
          last_price_update: updatedLeadData.desired_price || updatedLeadData.fees || updatedLeadData.furniture_price 
            ? new Date().toISOString() 
            : undefined,
          updated_at: new Date().toISOString()
        };

        const { error: ownerError } = await supabase
          .from('owners')
          .update(ownerUpdates)
          .eq('id', lead.id);

        if (ownerError) {
          console.error("Error updating owner data:", ownerError);
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de sauvegarder les données propriétaire."
          });
          return;
        }

        console.log("Owner data saved successfully to owners table only");
        
        if (!silent) {
          toast({
            title: "Propriétaire mis à jour",
            description: "Les modifications ont été enregistrées avec succès."
          });
        }
        
        setHasChanges(false);
      } else {
        // Pour les autres types de leads, utiliser updateLead
        const updatedLead = await updateLead({
          ...updatedLeadData,
          phoneCountryCode: updatedLeadData.phoneCountryCode || '+33',
          phoneCountryCodeDisplay: updatedLeadData.phoneCountryCodeDisplay || '🇫🇷',
          preferredLanguage: updatedLeadData.preferredLanguage || null
        });
        
        if (updatedLead) {
          if (!silent) {
            toast({
              title: "Lead mis à jour",
              description: "Les modifications ont été enregistrées avec succès."
            });
          }
          
          setLead(updatedLead);
          setHasChanges(false);
        }
      }
    } catch (error) {
      console.error("Error saving:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'enregistrer les modifications."
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
        handleSave(true);
      }, 2000);
      
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
    
    console.log("Updating lead data:", data);
    
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
      
      if (data.phoneCountryCode || data.phoneCountryCodeDisplay || data.phone) {
        console.log("Phone data change detected:", {
          prevCode: prev.phoneCountryCode,
          newCode: data.phoneCountryCode || prev.phoneCountryCode,
          prevDisplay: prev.phoneCountryCodeDisplay,
          newDisplay: data.phoneCountryCodeDisplay || prev.phoneCountryCodeDisplay,
          prevPhone: prev.phone,
          newPhone: data.phone || prev.phone
        });
      }
      
      if (data.preferredLanguage !== undefined) {
        console.log("Language change detected:", {
          prevLanguage: prev.preferredLanguage,
          newLanguage: data.preferredLanguage
        });
      }
      
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
      
      if (pendingActionsCount > 0 && !hasShownPendingActionsToast) {
        toast({
          title: "Actions en attente",
          description: `Vous avez ${pendingActionsCount} action${pendingActionsCount > 1 ? 's' : ''} à réaliser`,
        });
        setHasShownPendingActionsToast(true);
      }
    }
  }, [lead?.actionHistory, hasShownPendingActionsToast]);

  const fetchJacquesId = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('id')
        .ilike('name', '%jacques%')
        .single();
    
    if (error) {
      console.error('Error fetching Jacques ID:', error);
      return null;
    }
    
    return data?.id || null;
  } catch (error) {
    console.error('Unexpected error fetching Jacques ID:', error);
    return null;
  }
};

const handleReassignToJacques = async () => {
  if (!lead) return;

  const jacquesId = JACQUES_ID; // Using the constant
    
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
    startCallTracking: (type: 'phone' | 'whatsapp' = 'phone') => {
      setIsCallTracking(true);
      setCallStartTime(new Date());
      setCallType(type);
    },
    endCallTracking: (callDuration: number) => {
      if (!lead || !isCallTracking) return;
      
      const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
      };
      
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
    },
    formatDuration: (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    },
    handleReassignToJacques
  };
}
