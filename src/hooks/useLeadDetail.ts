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
  const [hasShownPendingActionsToast, setHasShownPendingActionsToast] = useState(false);
  const [lastFetchAttempt, setLastFetchAttempt] = useState<Date | null>(null);

  const fetchLead = useCallback(async () => {
    if (id) {
      try {
        setIsLoading(true);
        
        setLastFetchAttempt(new Date());
        
        const leadData = await getLead(id);
        console.log("Fetched lead data:", leadData);
        
        if (leadData) {
          setLead(leadData);
          setHasChanges(false);
        } else {
          console.log("Lead data not found, will retry later");
          
          const allLeads = await getLeads();
          const matchingLead = allLeads.find(l => l.id === id);
          
          if (matchingLead) {
            console.log("Lead found in all leads:", matchingLead);
            setLead(matchingLead);
            setHasChanges(false);
          } else {
            console.log("Lead not found in database");
          }
        }
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
    
    const intervalId = setInterval(() => {
      if (!lead && lastFetchAttempt) {
        const now = new Date();
        const diffSeconds = (now.getTime() - lastFetchAttempt.getTime()) / 1000;
        
        if (diffSeconds > 30) {
          console.log("No lead data after 30 seconds, retrying fetch");
          fetchLead();
        }
      }
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [fetchLead, lead, lastFetchAttempt]);

  const handleSave = async (silent = false) => {
    if (!lead) return;
    
    try {
      setIsSaving(true);
      console.log("Saving lead data:", lead);
      
      const updatedLead = await updateLead({
        ...lead,
        phoneCountryCode: lead.phoneCountryCode || '+33',
        phoneCountryCodeDisplay: lead.phoneCountryCodeDisplay || '🇫🇷',
        preferredLanguage: lead.preferredLanguage || null
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
