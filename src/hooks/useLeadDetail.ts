
import { useState, useCallback, useEffect } from 'react';
import { LeadDetailed } from '@/types/lead';
import { ActionHistory } from '@/types/actionHistory';
import { getLead, updateLead } from '@/services/leadService';
import { toast } from '@/hooks/use-toast';

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

  const fetchLead = useCallback(async () => {
    if (id) {
      try {
        setIsLoading(true);
        const leadData = await getLead(id);
        console.log("Fetched lead data:", leadData);
        setLead(leadData || undefined);
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
      
      // Make sure we're sending all required fields explicitly with fallbacks
      const updatedLead = await updateLead({
        ...lead,
        phoneCountryCode: lead.phoneCountryCode || '+33',
        phoneCountryCodeDisplay: lead.phoneCountryCodeDisplay || '🇫🇷',
        preferredLanguage: lead.preferredLanguage || null // Explicit null if not defined
      });
      
      if (updatedLead) {
        if (!silent) {
          toast({
            title: "Lead mis à jour",
            description: "Les modifications ont été enregistrées avec succès."
          });
        }
        
        // Mettre à jour le lead avec les données retournées par l'API pour assurer la cohérence
        setLead(updatedLead);
        setHasChanges(false);
      }
    } catch (error) {
      console.error("Error saving lead:", error);
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
        // Use silent save for automatic saves
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
    
    setLead(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      
      // Log fields changes for debugging
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

  // Format a phone number for calls
  const getFormattedPhoneForCall = () => {
    if (!lead?.phone) return '';
    
    // Ensure country code is present
    const countryCode = lead.phoneCountryCode || '+33';
    const phoneNumber = lead.phone.startsWith('+') 
      ? lead.phone.substring(1) // Remove + if it exists
      : lead.phone.startsWith('0') 
        ? lead.phone.substring(1) // Remove leading 0 if it exists
        : lead.phone;
    
    // Assemble the complete number with country code
    return `${countryCode}${phoneNumber}`;
  };
  
  // Format a phone number for WhatsApp
  const getFormattedPhoneForWhatsApp = () => {
    if (!lead?.phone) return '';
    
    // Get formatted phone for international format (same as call)
    const fullPhone = getFormattedPhoneForCall();
    
    // Remove any non-digit characters for WhatsApp
    return fullPhone.replace(/\D/g, '');
  };

  // Start tracking a call
  const startCallTracking = (type: 'phone' | 'whatsapp' = 'phone') => {
    setIsCallTracking(true);
    setCallStartTime(new Date());
    setCallType(type);
  };

  // End call tracking and record the action
  const endCallTracking = (callDuration: number) => {
    if (!lead || !isCallTracking) return;
    
    // Create a new action for the call
    const callAction: ActionHistory = {
      id: crypto.randomUUID(),
      actionType: 'Call',
      notes: `${callType === 'whatsapp' ? 'WhatsApp' : 'Appel'} de ${formatDuration(callDuration)}`,
      createdAt: callStartTime?.toISOString() || new Date().toISOString(),
      scheduledDate: callStartTime?.toISOString() || new Date().toISOString(),
      completedDate: new Date().toISOString()
    };
    
    // Update the lead with the new action
    handleDataChange({
      actionHistory: [...(lead.actionHistory || []), callAction],
      lastContactedAt: new Date().toISOString()
    });
    
    // Reset call tracking state
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
    getFormattedPhoneForCall,
    getFormattedPhoneForWhatsApp,
    startCallTracking,
    endCallTracking,
    formatDuration
  };
}
