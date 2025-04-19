
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
      
      const cleanedPhone = phone.replace(/[^\d+]/g, '');
      window.open(`https://wa.me/${cleanedPhone}`, '_blank');
    }
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (phone) {
      setIsCallDialogOpen(true);
      setCallStatus('calling');
      
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      
      setCallTimer(timer);
      
      if (onPhoneCall) {
        onPhoneCall(e);
      }
      
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
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="0.5"
                  >
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.53 3.642 1.444 5.154L2.1 20.6l3.6-.9A9.936 9.936 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 1.8c4.548 0 8.2 3.652 8.2 8.2 0 4.548-3.652 8.2-8.2 8.2-1.495 0-2.889-.404-4.1-1.106l-.318-.201-2.692.673.687-2.724-.198-.32A8.264 8.264 0 013.8 12c0-4.548 3.652-8.2 8.2-8.2zm4.92 6.268c-.189-.097-1.14-.562-1.316-.628-.176-.067-.305-.1-.44.099-.133.198-.514.629-.63.758-.116.099-.232.113-.422.014-.189-.1-.8-.295-1.522-.941-.563-.499-.942-1.115-1.052-1.303-.11-.197-.013-.298.084-.396.085-.087.189-.227.283-.34.092-.115.124-.198.187-.33.062-.133.03-.249-.015-.347-.047-.099-.44-1.055-.602-1.45-.158-.38-.32-.328-.44-.336l-.359-.008c-.13 0-.341.048-.518.24-.176.198-.674.66-.674 1.605 0 .947.694 1.86.791 1.983.097.123 1.367 2.092 3.312 2.934.29.125.509.2.683.255.287.092.547.078.753.047.23-.034.704-.287.803-.567.099-.28.099-.52.07-.57-.031-.05-.11-.08-.232-.133z" />
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
