import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import CustomButton from '@/components/ui/CustomButton';
import TagBadge, { LeadTag } from '@/components/common/TagBadge';
import { formatBudget } from '@/components/pipeline/mobile/utils/leadFormatUtils';
import { Currency } from '@/types/lead';
import { useAuth } from '@/hooks/useAuth';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from 'react';
import { ActionHistory } from '@/types/actionHistory';

interface LeadDetailHeaderProps {
  name: string;
  createdAt?: string;
  phone?: string;
  email?: string;
  budget?: string;
  currency?: Currency;
  desiredLocation?: string;
  country?: string;
  purchaseTimeframe?: string;
  onBackClick: () => void;
  onSave: () => void;
  isSaving: boolean;
  hasChanges: boolean;
  tags?: LeadTag[];
  onPhoneCall?: (e: React.MouseEvent) => void;
  onWhatsAppClick?: (e: React.MouseEvent) => void;
  onEmailClick?: (e: React.MouseEvent) => void;
  onCallComplete?: (duration: number) => void;
}

const LeadDetailHeader: React.FC<LeadDetailHeaderProps> = ({
  name,
  createdAt,
  phone,
  email,
  budget,
  currency,
  desiredLocation,
  country,
  purchaseTimeframe,
  onBackClick,
  onSave,
  isSaving,
  hasChanges,
  tags,
  onPhoneCall,
  onWhatsAppClick,
  onEmailClick,
  onCallComplete
}) => {
  const { isAdmin } = useAuth();
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'completed' | 'failed'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [callTimer, setCallTimer] = useState<NodeJS.Timeout | null>(null);

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (phone) {
      // Add a WhatsApp action
      const whatsappAction: ActionHistory = {
        id: crypto.randomUUID(),
        actionType: 'WhatsApp',
        notes: 'Déclenchement d\'une conversation WhatsApp',
        createdAt: new Date().toISOString(),
        scheduledDate: new Date().toISOString(),
        completedDate: new Date().toISOString()
      };
      
      if (onWhatsAppClick) {
        onWhatsAppClick(e);
      }
      
      // Actually open WhatsApp
      const cleanedPhone = phone.replace(/[^\d+]/g, '');
      window.open(`https://wa.me/${cleanedPhone}`, '_blank');
    }
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (phone) {
      // Start the call dialog first
      setIsCallDialogOpen(true);
      setCallStatus('calling');
      
      // Start the timer
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      
      setCallTimer(timer);
      
      // Trigger the parent's callback
      if (onPhoneCall) {
        onPhoneCall(e);
      }
      
      // Actually make the call using the tel: protocol
      window.location.href = `tel:${phone}`;
    }
  };

  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEmailClick) {
      onEmailClick(e);
    } else if (email) {
      window.location.href = `mailto:${email}`;
    }
  };

  const endCall = (status: 'completed' | 'failed') => {
    if (callTimer) {
      clearInterval(callTimer);
    }
    
    setCallStatus(status);
    
    if (status === 'completed' && callDuration > 0 && onCallComplete) {
      onCallComplete(callDuration);
    }
    
    setTimeout(() => {
      setIsCallDialogOpen(false);
      setCallDuration(0);
      setCallStatus('idle');
    }, 1500);
  };
  
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return <div className="flex items-center justify-between p-3 w-full bg-loro-50">
      <div className="flex items-center gap-2 flex-1">
        <Button variant="ghost" size="icon" onClick={onBackClick} className="p-2 text-loro-900 hover:bg-transparent transition-transform hover:scale-110 duration-200 flex-shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="truncate">
          <h1 className="text-lg font-futura leading-tight truncate max-w-[180px] sm:max-w-[300px] md:max-w-[500px]">{name}</h1>
          <p className="text-xs text-loro-terracotta">
            {createdAt && format(new Date(createdAt), 'dd/MM/yyyy')}
          </p>
          <div className="flex flex-wrap gap-2 mt-1 max-w-[250px] sm:max-w-[350px] md:max-w-[450px]">
            {budget && <span className="text-xs bg-[#F5F3EE] px-2 py-1 rounded-xl border border-zinc-200">
                {formatBudget(budget, currency)}
              </span>}
            {desiredLocation && <span className="text-xs bg-[#EBD5CE] px-2 py-1 rounded-xl">
                {desiredLocation}
              </span>}
            {country && <span className="text-xs bg-[#F3E9D6] px-2 py-1 rounded-xl border border-zinc-200">
                {country}
              </span>}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          {phone && <>
              <button onClick={handlePhoneClick} className="h-8 w-8 flex items-center justify-center rounded-full border border-white transition-transform hover:scale-110 duration-200" aria-label="Appeler">
                <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium rounded-full">
                  <Phone className="h-4 w-4" />
                </div>
              </button>
              <button onClick={handleWhatsAppClick} className="h-8 w-8 flex items-center justify-center rounded-full border border-white transition-transform hover:scale-110 duration-200" aria-label="WhatsApp">
                <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24" height="24" fill="#25D366">
                    <path d="M4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.519,18.98-24.014,18.98c-0.004,0,0,0,0,0h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303z"/>
                    <path fill="#FFF" d="M4.868,43.803c-0.132,0-0.26-0.052-0.355-0.148c-0.125-0.127-0.174-0.312-0.129-0.483l2.639-9.636c-1.636-2.906-2.499-6.206-2.497-9.556C4.532,13.238,13.273,4.5,24.014,4.5c5.21,0.002,10.105,2.031,13.784,5.713c3.679,3.683,5.704,8.577,5.702,13.781c-0.004,10.741-8.746,19.48-19.486,19.48c-3.189-0.001-6.344-0.788-9.144-2.277l-9.741,2.562C4.968,43.788,4.868,43.803,4.868,43.803z"/>
                    <path fill="#25D366" d="M24.014,5.332c4.956,0.002,9.601,1.917,13.102,5.419c3.5,3.5,5.412,8.146,5.41,13.1c-0.004,10.166-8.285,18.438-18.451,18.438c-0.004,0,0,0,0,0h-0.006c-3.01-0.001-5.962-0.746-8.562-2.141l-0.273-0.137l-9.024,2.364l2.414-8.726l-0.152-0.285c-1.532-2.887-2.343-6.166-2.341-9.516C5.432,13.516,13.716,5.332,24.014,5.332z"/>
                    <path fill="#FFF" d="M35.176,23.397c-0.028-0.015-1.013-0.507-1.176-0.564c-0.467-0.187-1.092-0.388-1.801,0.022c-0.522,0.313-0.814,0.503-1.207,0.802c-0.63,0.48-1.481,0.248-1.914-0.184l-2.722-2.722c-0.432-0.432-0.663-1.283-0.184-1.914c0.299-0.393,0.489-0.685,0.802-1.207c0.411-0.708,0.21-1.333,0.022-1.801l-0.564-1.176C24.74,15.037,24.047,15,23.781,15c-0.762,0-1.359,0.199-1.801,0.496c-0.471,0.33-0.918,0.75-1.213,1.2c-0.617,0.898-0.837,2.055-0.479,3.086c0.464,1.339,1.313,2.6,2.306,3.715l2.861,2.86c1.111,1.111,2.372,1.96,3.715,2.306c1.031,0.358,2.188,0.138,3.086-0.479c0.45-0.296,0.871-0.742,1.2-1.213c0.297-0.441,0.496-1.039,0.496-1.801C35.365,24.197,35.332,23.548,35.176,23.397z"/>
                  </svg>
                </div>
              </button>
            </>}
          {email && <button onClick={handleEmailClick} className="h-8 w-8 flex items-center justify-center rounded-full border border-white transition-transform hover:scale-110 duration-200" aria-label="Email">
              <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium rounded-full">
                <Mail className="h-4 w-4" />
              </div>
            </button>}
        </div>
        {tags && tags.length > 0 && <div className="flex flex-wrap justify-end gap-1 max-w-[150px]">
            {tags.map((tag, index) => <TagBadge key={`${tag}-${index}`} tag={tag} className="text-xs py-0.5" />)}
          </div>}
      </div>

      <AlertDialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {callStatus === 'calling' ? 'Appel en cours...' : 
               callStatus === 'completed' ? 'Appel terminé' : 
               callStatus === 'failed' ? 'Appel échoué' : 
               'Appel'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {callStatus === 'calling' ? (
                <div className="text-center py-4">
                  <div className="flex justify-center mb-4">
                    <div className="animate-pulse bg-green-100 rounded-full p-4">
                      <Phone className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div>Durée : <span className="text-2xl font-semibold mt-2">{formatDuration(callDuration)}</span></div>
                </div>
              ) : callStatus === 'completed' ? (
                <div>L'appel a été enregistré avec succès.</div>
              ) : callStatus === 'failed' ? (
                <div>L'appel n'a pas pu être effectué.</div>
              ) : (
                <div>Comment souhaitez-vous procéder ?</div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {callStatus === 'calling' ? (
              <>
                <AlertDialogCancel onClick={() => endCall('failed')}>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={() => endCall('completed')} className="bg-green-600 hover:bg-green-700">
                  Terminer l'appel
                </AlertDialogAction>
              </>
            ) : callStatus === 'completed' || callStatus === 'failed' ? (
              <AlertDialogAction onClick={() => setIsCallDialogOpen(false)}>OK</AlertDialogAction>
            ) : (
              <AlertDialogCancel>Annuler</AlertDialogCancel>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};

export default LeadDetailHeader;
