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
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16" height="16" viewBox="0 0 48 48" className="h-4 w-4">
                    <path fill="#fff" d="M4.868,43.303l2.694-9.835C5.9,30.59,5.027,27.324,5.027,23.979C5.027,13.154,13.711,4.5,24.554,4.5c5.178,0,10.05,2.029,13.689,5.352c3.638,3.323,5.65,7.812,5.647,12.552c-0.004,10.332-8.69,18.723-19.555,18.723c-0.021,0-0.004,0-0.004,0h-0.01c-3.176-0.001-6.288-0.797-9.029-2.301L4.868,43.303z"></path>
                    <path fill="#0cb457" d="M4.868,43.803c-0.157,0-0.303-0.052-0.432-0.16c-0.159-0.161-0.221-0.401-0.166-0.626l2.699-9.904c-1.677-2.872-2.562-6.13-2.562-9.476C4.507,13.498,13.448,4.5,24.554,4.5c5.674,0,10.995,2.217,15.009,6.247c4.085,4.102,6.133,9.531,6.127,15.384c-0.007,10.898-8.957,19.727-19.968,19.727c-3.295-0.001-6.463-0.837-9.281-2.415L5.078,43.648C4.997,43.762,4.936,43.803,4.868,43.803z"></path>
                    <path fill="#0cb457" d="M24.554,5c5.379,0,10.438,2.091,14.274,5.886c3.805,3.792,5.69,8.884,5.684,14.178c-0.006,10.332-8.351,18.732-18.502,18.732c-3.094,0-6.067-0.749-8.726-2.167l-0.349-0.199l-3.656,1.096l1.115-3.847l-0.211-0.361c-1.559-2.673-2.383-5.746-2.383-8.932C5.527,13.928,13.798,5,24.554,5 M24.554,4C13.184,4,4.027,13.23,4.027,23.979c0,3.442,0.913,6.847,2.645,9.807L2.872,43.803c-0.291,0-0.537-0.239-0.537-0.53c0-0.136,0.047-0.273,0.144-0.379l2.716-9.977C3.311,30.75,2.465,27.398,2.465,23.979C2.465,12.695,11.749,4,24.554,4c5.874,0,11.389,2.333,15.535,6.547C44.313,14.941,46.5,20.526,46.5,26.479c0,10.908-8.783,19.727-19.615,19.727c-3.359,0-6.589-0.854-9.459-2.469l-9.758,2.936c-0.149,0.043-0.302,0.065-0.456,0.065c-0.405,0-0.791-0.151-1.093-0.427c-0.736-0.813-0.322-2.034,0.531-2.277l9.234-2.777c0.91-0.272,1.631-0.942,1.961-1.811l0.911-2.516c-1.027-0.739-4.205-2.784-5.494-3.678c-0.265-0.176-0.435-0.476-0.435-0.804c0-0.379,0.213-0.717,0.553-0.891c1.117-0.562,2.249-1.16,3.365-1.741c0.26-0.133,0.551-0.168,0.83-0.097c0.268,0.067,0.501,0.249,0.635,0.491l1.47,2.521c1.382-1.141,3.084-2.647,4.713-4.308c0.236-0.236,0.555-0.361,0.889-0.361c0.379,0,0.717,0.214,0.894,0.553c0.402,0.796,0.859,1.612,1.36,2.43c0.652,1.053,1.425,2.023,2.312,2.893c0.914,0.896,1.967,1.678,3.143,2.331c1.106,0.618,2.264,1.095,3.457,1.425c0.399,0.107,0.698,0.45,0.698,0.862c0,0.359-0.214,0.678-0.551,0.812l-2.706,1.074c-0.284,0.113-0.586,0.139-0.88,0.076c-0.294-0.062-0.561-0.214-0.772-0.438c-0.585-0.623-1.214-1.285-1.858-1.977c-1.428,1.361-3.08,2.473-4.933,3.313l2.536,1.786c0.285,0.2,0.465,0.526,0.465,0.876c0,0.358-0.193,0.68-0.513,0.849l-3.495,1.85c-0.225,0.119-0.474,0.18-0.73,0.18c-0.451,0-0.882-0.213-1.156-0.583l-2.116-3.049c-1.632,0.667-3.337,1.041-5.089,1.117C24.613,45.264,35.065,36.785,35.065,26.479c0-5.212-1.885-10.005-5.266-13.465C26.475,9.613,21.618,7.5,16.608,7.5c-5.01,0-9.868,2.113-13.421,5.847c-3.532,3.706-5.475,8.63-5.472,13.805c0.002,3.387,0.875,6.687,2.541,9.574l-2.711,9.941c-0.146,0.537,0.285,1.061,0.839,1.061c0.146,0,0.285-0.041,0.405-0.127l9.86-5.888C16.224,44.554,20.348,45.5,24.554,45.5c11.023,0,19.962-8.955,19.968-19.985c0.003-5.284-2.051-10.233-5.781-13.944C35.133,7.164,30.067,5,24.554,5L24.554,4z"></path>
                    <path fill="#fff" d="M35.402,12.251c-3.168-3.179-7.386-4.935-11.871-4.935c-9.242,0-16.763,7.542-16.763,16.817c0,3.016,0.798,5.952,2.316,8.556l0.308,0.52l-1.296,4.773l4.886-1.266l0.497,0.297c2.517,1.504,5.389,2.296,8.318,2.296h0.005c9.234,0,16.759-7.543,16.759-16.816C40.308,19.791,38.571,15.43,35.402,12.251z"></path>
                    <path fill="#40c351" d="M29.81,33.963c-0.749,0-1.432-0.246-2.205-0.554c-0.575-0.236-1.263-0.518-1.964-0.854l-0.463-0.214c-1.792-0.829-3.596-1.777-5.185-3.103l-0.26-0.232l-4.026,1.044l1.055-3.939l-0.248-0.271c-1.326-1.821-2.278-3.909-2.836-6.201c-0.408-1.663-0.488-3.229-0.232-4.643c0.301-1.69,1.159-3.223,2.428-4.367c0.468-0.439,0.979-0.804,1.522-1.086c0.577-0.296,1.194-0.521,1.839-0.673c0.807-0.177,1.645-0.192,2.481-0.046c0.646,0.118,1.266,0.339,1.848,0.659c0.67,0.368,1.262,0.851,1.762,1.438c1.023,1.152,1.599,2.611,1.679,4.168c0.047,0.919-0.121,1.835-0.5,2.679c-0.324,0.725-0.818,1.4-1.462,1.991c-0.3,0.293-0.632,0.556-0.983,0.794c-0.364,0.246-0.75,0.47-1.135,0.687c-0.225,0.13-0.463,0.264-0.697,0.405c0.114,0.188,0.245,0.383,0.403,0.595c0.295,0.404,0.861,1.177,1.688,2.249c1.082,1.353,2.413,2.56,3.964,3.592c0.499,0.351,1.008,0.668,1.548,0.95c0.307,0.161,0.587,0.308,0.86,0.455l0.749-2.788c0.185-0.684,0.887-1.113,1.604-0.975c0.307,0.06,0.59,0.214,0.813,0.442l2.614,2.666C40.261,33.161,35.279,33.963,29.81,33.963z"></path>
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
