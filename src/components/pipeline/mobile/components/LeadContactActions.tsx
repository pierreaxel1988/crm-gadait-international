
import React, { useState } from 'react';
import { Phone, Mail } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface LeadContactActionsProps {
  phone?: string;
  email?: string;
  phoneCountryCode?: string;
  handlePhoneCall: (e: React.MouseEvent) => void;
  handleWhatsAppClick: (e: React.MouseEvent) => void;
  handleEmailClick: (e: React.MouseEvent) => void;
}

const LeadContactActions: React.FC<LeadContactActionsProps> = ({
  phone,
  email,
  phoneCountryCode = '+33',
  handlePhoneCall,
  handleWhatsAppClick,
  handleEmailClick
}) => {
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [callType, setCallType] = useState<'phone' | 'whatsapp'>('phone');
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'completed' | 'failed'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [callTimer, setCallTimer] = useState<NodeJS.Timeout | null>(null);

  const startCall = (type: 'phone' | 'whatsapp', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setCallType(type);
    setIsCallDialogOpen(true);
    setCallStatus('calling');
    
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    setCallTimer(timer);
    
    if (type === 'phone') {
      handlePhoneCall(e);
    } else {
      handleWhatsAppClick(e);
    }
  };

  const endCall = (status: 'completed' | 'failed') => {
    if (callTimer) {
      clearInterval(callTimer);
    }
    
    setCallStatus(status);
    
    // Will close dialog after 1.5 seconds
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

  return <div className="flex items-center gap-1.5">
      <TooltipProvider>
        {phone && <>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={(e) => startCall('phone', e)} className="h-7 w-7 flex items-center justify-center rounded-full bg-loro-sand/20 border border-white transition-transform hover:scale-110 duration-200" aria-label="Appeler">
                  <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium rounded-full">
                    <Phone className="h-3.5 w-3.5" />
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Appeler</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={(e) => startCall('whatsapp', e)} className="h-7 w-7 flex items-center justify-center rounded-full bg-loro-sand/20 border border-white transition-transform hover:scale-110 duration-200" aria-label="WhatsApp">
                  <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium rounded-full">
                    <img alt="WhatsApp" src="https://img.icons8.com/?size=100&id=16712&format=png&color=000000" className="h-4 w-4 object-fill" />
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>WhatsApp</p>
              </TooltipContent>
            </Tooltip>
          </>}
        
        {email && <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={handleEmailClick} className="h-7 w-7 flex items-center justify-center rounded-full bg-loro-sand/20 border border-white transition-transform hover:scale-110 duration-200" aria-label="Email">
                <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium rounded-full">
                  <Mail className="h-3.5 w-3.5" />
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Email</p>
            </TooltipContent>
          </Tooltip>}
      </TooltipProvider>

      <AlertDialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {callStatus === 'calling' ? `${callType === 'phone' ? 'Appel' : 'WhatsApp'} en cours...` : 
               callStatus === 'completed' ? `${callType === 'phone' ? 'Appel' : 'WhatsApp'} terminé` : 
               callStatus === 'failed' ? `${callType === 'phone' ? 'Appel' : 'WhatsApp'} échoué` : 
               `${callType === 'phone' ? 'Appel' : 'WhatsApp'}`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {callStatus === 'calling' ? (
                <div className="text-center py-4">
                  <div className="flex justify-center mb-4">
                    <div className="animate-pulse bg-green-100 rounded-full p-4">
                      <Phone className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <p>Durée : <span className="text-2xl font-semibold mt-2">{formatDuration(callDuration)}</span></p>
                </div>
              ) : callStatus === 'completed' ? (
                <p>L'appel a été enregistré avec succès.</p>
              ) : callStatus === 'failed' ? (
                <p>L'appel n'a pas pu être effectué.</p>
              ) : (
                <p>Comment souhaitez-vous procéder ?</p>
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

export default LeadContactActions;
