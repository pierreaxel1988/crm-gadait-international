import React, { useState } from 'react';
import { Plus, Phone, Mail, X } from 'lucide-react';
import CustomButton from './CustomButton';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface FloatingActionButtonsProps {
  onAddAction: () => void;
  onCall?: () => void;
  onMail?: () => void;
  phoneNumber?: string;
  email?: string;
  className?: string;
  onCallComplete?: (duration: number) => void;
}

const WhatsAppButton = ({ phoneNumber, onClick }: { phoneNumber?: string, onClick: () => void }) => (
  <div className="flex items-center gap-3 animate-fade-in">
    <span className="bg-white/90 px-3 py-1 rounded-full text-sm shadow-sm">
      WhatsApp
    </span>
    <button
      className="h-12 w-12 rounded-full border border-white flex items-center justify-center shadow-md"
      onClick={onClick}
      title="WhatsApp"
    >
      <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium rounded-full">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="0.5"
        >
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.53 3.642 1.444 5.154L2.1 20.6l3.6-.9A9.936 9.936 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 1.8c4.548 0 8.2 3.652 8.2 8.2 0 4.548-3.652 8.2-8.2 8.2-1.495 0-2.889-.404-4.1-1.106l-.318-.201-2.692.673.687-2.724-.198-.32A8.264 8.264 0 013.8 12c0-4.548 3.652-8.2 8.2-8.2zm4.92 6.268c-.189-.097-1.14-.562-1.316-.628-.176-.067-.305-.1-.44.099-.133.198-.514.629-.63.758-.116.099-.232.113-.422.014-.189-.1-.8-.295-1.522-.941-.563-.499-.942-1.115-1.052-1.303-.11-.197-.013-.298.084-.396.085-.087.189-.227.283-.34.092-.115.124-.198.187-.33.062-.133.03-.249-.015-.347-.047-.099-.44-1.055-.602-1.45-.158-.38-.32-.328-.44-.336l-.359-.008c-.13 0-.341.048-.518.24-.176.198-.674.66-.674 1.605 0 .947.694 1.86.791 1.983.097.123 1.367 2.092 3.312 2.934.29.125.509.2.683.255.287.092.547.078.753.047.23-.034.704-.287.803-.567.099-.28.099-.52.07-.57-.031-.05-.11-.08-.232-.133z" />
        </svg>
      </div>
    </button>
  </div>
);

const CallButton = ({ onClick }: { onClick: () => void }) => (
  <div className="flex items-center gap-3 animate-fade-in">
    <span className="bg-white/90 px-3 py-1 rounded-full text-sm shadow-sm">
      Appeler
    </span>
    <button
      className="h-12 w-12 rounded-full border border-white flex items-center justify-center shadow-md"
      onClick={onClick}
      title="Appeler"
    >
      <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium rounded-full">
        <Phone className="h-5 w-5" />
      </div>
    </button>
  </div>
);

const EmailButton = ({ onClick }: { onClick: () => void }) => (
  <div className="flex items-center gap-3 animate-fade-in">
    <span className="bg-white/90 px-3 py-1 rounded-full text-sm shadow-sm">
      Envoyer un email
    </span>
    <button
      className="h-12 w-12 rounded-full border border-white flex items-center justify-center shadow-md"
      onClick={onClick}
      title="Envoyer un email"
    >
      <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium rounded-full">
        <Mail className="h-5 w-5" />
      </div>
    </button>
  </div>
);

const AddActionButton = ({ onClick }: { onClick: () => void }) => (
  <div className="flex items-center gap-3 animate-fade-in">
    <span className="bg-white/90 px-3 py-1 rounded-full text-sm shadow-sm">
      Ajouter une action
    </span>
    <button
      className="h-12 w-12 rounded-full border border-white flex items-center justify-center shadow-md"
      onClick={onClick}
      title="Ajouter une action"
    >
      <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium rounded-full">
        <Plus className="h-5 w-5" />
      </div>
    </button>
  </div>
);

const FloatingActionButtons = ({
  onAddAction,
  onCall,
  onMail,
  phoneNumber,
  email,
  className,
  onCallComplete
}: FloatingActionButtonsProps) => {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'completed' | 'failed'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [callTimer, setCallTimer] = useState<NodeJS.Timeout | null>(null);
  const [callType, setCallType] = useState<'phone' | 'whatsapp'>('phone');
  
  const startCall = (type: 'phone' | 'whatsapp') => {
    if (!phoneNumber) {
      return;
    }
    
    setCallType(type);
    setIsCallDialogOpen(true);
    setCallStatus('calling');
    
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    setCallTimer(timer);
    
    if (type === 'phone') {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      const cleanedPhone = phoneNumber.replace(/[^\d+]/g, '');
      window.open(`https://wa.me/${cleanedPhone}`, '_blank');
    }
    
    setIsExpanded(false);
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
  
  const handleCall = () => {
    startCall('phone');
  };
  
  const handleMail = () => {
    if (email) {
      window.location.href = `mailto:${email}`;
    } else if (onMail) {
      onMail();
    }
    setIsExpanded(false);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const handleWhatsApp = () => {
    startCall('whatsapp');
  };

  const handleAddActionClick = () => {
    onAddAction();
    setIsExpanded(false);
  };
  
  const WhatsAppSvgIcon = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0.5"
    >
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.53 3.642 1.444 5.154L2.1 20.6l3.6-.9A9.936 9.936 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 1.8c4.548 0 8.2 3.652 8.2 8.2 0 4.548-3.652 8.2-8.2 8.2-1.495 0-2.889-.404-4.1-1.106l-.318-.201-2.692.673.687-2.724-.198-.32A8.264 8.264 0 013.8 12c0-4.548 3.652-8.2 8.2-8.2zm4.92 6.268c-.189-.097-1.14-.562-1.316-.628-.176-.067-.305-.1-.44.099-.133.198-.514.629-.63.758-.116.099-.232.113-.422.014-.189-.1-.8-.295-1.522-.941-.563-.499-.942-1.115-1.052-1.303-.11-.197-.013-.298.084-.396.085-.087.189-.227.283-.34.092-.115.124-.198.187-.33.062-.133.03-.249-.015-.347-.047-.099-.44-1.055-.602-1.45-.158-.38-.32-.328-.44-.336l-.359-.008c-.13 0-.341.048-.518.24-.176.198-.674.66-.674 1.605 0 .947.694 1.86.791 1.983.097.123 1.367 2.092 3.312 2.934.29.125.509.2.683.255.287.092.547.078.753.047.23-.034.704-.287.803-.567.099-.28.099-.52.07-.57-.031-.05-.11-.08-.232-.133z" />
    </svg>
  );

  if (isMobile) {
    return (
      <div className={cn(
        "fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50",
        className
      )}>
        {isExpanded && (
          <>
            {(phoneNumber || onCall) && <CallButton onClick={handleCall} />}
            
            {phoneNumber && (
              <div className="flex items-center gap-3 animate-fade-in">
                <span className="bg-white/90 px-3 py-1 rounded-full text-sm shadow-sm">
                  WhatsApp
                </span>
                <button
                  className="h-12 w-12 rounded-full border border-white flex items-center justify-center shadow-md"
                  onClick={handleWhatsApp}
                  title="WhatsApp"
                >
                  <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium rounded-full">
                    <WhatsAppSvgIcon />
                  </div>
                </button>
              </div>
            )}
            
            {(email || onMail) && <EmailButton onClick={handleMail} />}
            
            <AddActionButton onClick={handleAddActionClick} />
          </>
        )}
        
        <button
          className={cn(
            "h-14 w-14 rounded-full flex items-center justify-center shadow-md transition-all",
            isExpanded 
              ? "bg-white text-gray-800 border border-gray-200" 
              : "bg-gray-800 text-white"
          )}
          onClick={toggleExpand}
          title={isExpanded ? "Fermer" : "Actions"}
        >
          {isExpanded ? (
            <X className="h-6 w-6" />
          ) : (
            <Plus className="h-6 w-6" />
          )}
        </button>

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
      </div>
    );
  }
  
  return (
    <div className={cn(
      "fixed bottom-6 right-6 flex flex-col gap-2 z-50",
      className
    )}>
      <button
        className="h-12 w-12 rounded-full bg-gray-800 text-white flex items-center justify-center shadow-md hover:bg-gray-700"
        onClick={onAddAction}
        title="Ajouter une action"
      >
        <Plus className="h-5 w-5" />
      </button>
      
      {(phoneNumber || onCall) && (
        <>
          <button
            className="h-12 w-12 rounded-full border border-white flex items-center justify-center shadow-md"
            onClick={handleCall}
            title="Appeler"
          >
            <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium rounded-full">
              <Phone className="h-5 w-5" />
            </div>
          </button>
          
          {phoneNumber && (
            <button
              className="h-12 w-12 rounded-full border border-white flex items-center justify-center shadow-md"
              onClick={handleWhatsApp}
              title="WhatsApp"
            >
              <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium rounded-full">
                <WhatsAppSvgIcon />
              </div>
            </button>
          )}
        </>
      )}
      
      {(email || onMail) && (
        <button
          className="h-12 w-12 rounded-full border border-white flex items-center justify-center shadow-md"
          onClick={handleMail}
          title="Envoyer un email"
        >
          <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium rounded-full">
            <Mail className="h-5 w-5" />
          </div>
        </button>
      )}

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
    </div>
  );
};

export default FloatingActionButtons;
