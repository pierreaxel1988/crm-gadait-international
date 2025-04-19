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
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4"
                      viewBox="0 0 50 50"
                      fill="currentColor"
                    >
                      <path d="M25 2C12.309 2 2 12.309 2 25c0 4.418 1.293 8.519 3.516 11.984L2.05 47.95l11.047-3.48C16.481 46.707 20.582 48 25 48c12.691 0 23-10.309 23-23S37.691 2 25 2zm0 42c-4.019 0-7.777-1.176-10.902-3.199l-.777-.481-6.566 2.07 2.116-6.64-.504-.815C6.587 32.074 5.5 28.626 5.5 25c0-10.752 8.748-19.5 19.5-19.5S44.5 14.248 44.5 25 35.752 44 25 44zm10.053-13.969c-.547-.273-3.234-1.594-3.738-1.777-.504-.186-.872-.273-1.242.273-.367.547-1.418 1.777-1.738 2.145-.32.367-.641.414-1.188.141-.547-.273-2.309-.848-4.402-2.695-1.625-1.449-2.723-3.234-3.043-3.781-.32-.547-.035-.844.24-1.117.25-.25.547-.641.82-.961.273-.32.363-.547.547-.914.183-.367.09-.688-.047-.961-.137-.273-1.242-2.992-1.703-4.117-.449-1.078-.91-.934-1.242-.949l-1.055-.02c-.367 0-.961.137-1.465.688-.504.547-1.934 1.887-1.934 4.594 0 2.707 1.98 5.32 2.254 5.68.273.359 3.9 5.945 9.453 8.066.813.348 1.445.555 1.938.711.813.258 1.555.219 2.137.133.652-.098 2.004-.82 2.289-1.613.281-.793.281-1.473.195-1.613-.086-.141-.5-.219-1.047-.492z"/>
                    </svg>
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
