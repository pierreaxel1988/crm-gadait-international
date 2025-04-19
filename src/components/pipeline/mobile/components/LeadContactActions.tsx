
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
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="0.5"
                    >
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.53 3.642 1.444 5.154L2.1 20.6l3.6-.9A9.936 9.936 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 1.8c4.548 0 8.2 3.652 8.2 8.2 0 4.548-3.652 8.2-8.2 8.2-1.495 0-2.889-.404-4.1-1.106l-.318-.201-2.692.673.687-2.724-.198-.32A8.264 8.264 0 013.8 12c0-4.548 3.652-8.2 8.2-8.2zm4.92 6.268c-.189-.097-1.14-.562-1.316-.628-.176-.067-.305-.1-.44.099-.133.198-.514.629-.63.758-.116.099-.232.113-.422.014-.189-.1-.8-.295-1.522-.941-.563-.499-.942-1.115-1.052-1.303-.11-.197-.013-.298.084-.396.085-.087.189-.227.283-.34.092-.115.124-.198.187-.33.062-.133.03-.249-.015-.347-.047-.099-.44-1.055-.602-1.45-.158-.38-.32-.328-.44-.336l-.359-.008c-.13 0-.341.048-.518.24-.176.198-.674.66-.674 1.605 0 .947.694 1.86.791 1.983.097.123 1.367 2.092 3.312 2.934.29.125.509.2.683.255.287.092.547.078.753.047.23-.034.704-.287.803-.567.099-.28.099-.52.07-.57-.031-.05-.11-.08-.232-.133z" />
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
