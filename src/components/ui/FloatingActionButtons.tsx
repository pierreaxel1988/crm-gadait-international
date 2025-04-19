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

// WhatsApp button component
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
          viewBox="0 0 50 50"
          fill="currentColor"
        >
          <path d="M25 2C12.309 2 2 12.309 2 25c0 4.418 1.293 8.519 3.516 11.984L2.05 47.95l11.047-3.48C16.481 46.707 20.582 48 25 48c12.691 0 23-10.309 23-23S37.691 2 25 2zm0 42c-4.019 0-7.777-1.176-10.902-3.199l-.777-.481-6.566 2.07 2.116-6.64-.504-.815C6.587 32.074 5.5 28.626 5.5 25c0-10.752 8.748-19.5 19.5-19.5S44.5 14.248 44.5 25 35.752 44 25 44zm10.053-13.969c-.547-.273-3.234-1.594-3.738-1.777-.504-.186-.872-.273-1.242.273-.367.547-1.418 1.777-1.738 2.145-.32.367-.641.414-1.188.141-.547-.273-2.309-.848-4.402-2.695-1.625-1.449-2.723-3.234-3.043-3.781-.32-.547-.035-.844.24-1.117.25-.25.547-.641.82-.961.273-.32.363-.547.547-.914.183-.367.09-.688-.047-.961-.137-.273-1.242-2.992-1.703-4.117-.449-1.078-.91-.934-1.242-.949l-1.055-.02c-.367 0-.961.137-1.465.688-.504.547-1.934 1.887-1.934 4.594 0 2.707 1.98 5.32 2.254 5.68.273.359 3.9 5.945 9.453 8.066.813.348 1.445.555 1.938.711.813.258 1.555.219 2.137.133.652-.098 2.004-.82 2.289-1.613.281-.793.281-1.473.195-1.613-.086-.141-.5-.219-1.047-.492z"/>
        </svg>
      </div>
    </button>
  </div>
);

// Call button component
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

// Email button component
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

// Add action button component
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

  if (isMobile) {
    return (
      <div className={cn(
        "fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50",
        className
      )}>
        {isExpanded && (
          <>
            {(phoneNumber || onCall) && <CallButton onClick={handleCall} />}
            
            {phoneNumber && <WhatsAppButton phoneNumber={phoneNumber} onClick={handleWhatsApp} />}
            
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
                <img 
                  src="/lovable-uploads/bf1a6b76-83f4-46cb-bb39-25f80e1c5289.png" 
                  alt="WhatsApp"
                  className="h-5 w-5"
                />
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
