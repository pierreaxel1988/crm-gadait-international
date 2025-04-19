
import React, { useState } from 'react';
import { Mail, Phone, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ActionDialog from '@/components/leads/actions/ActionDialog';
import { TaskType } from '@/components/kanban/KanbanCard';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { addActionToLead } from '@/services/leadActions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ContactInfoProps {
  email: string;
  phone?: string;
  leadId?: string;
}

const ContactInfo = ({ email, phone, leadId }: ContactInfoProps) => {
  const navigate = useNavigate();
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<TaskType | null>(null);
  const [actionDate, setActionDate] = useState<Date | undefined>(undefined);
  const [actionTime, setActionTime] = useState<string>('12:00');
  const [actionNotes, setActionNotes] = useState<string>('');

  const handleAddAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (leadId) {
      setIsActionDialogOpen(true);
    }
  };

  const handleEmailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `mailto:${email}`;
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (phone) {
      const cleanedPhone = phone.replace(/[^\d+]/g, '');
      window.open(`https://wa.me/${cleanedPhone}`, '_blank');
    }
  };

  const getActionTypeIcon = (type: TaskType) => {
    switch (type) {
      case 'Call': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-futura">Appel</span>;
      case 'Visites': return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-futura">Visite</span>;
      case 'Compromis': return <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-futura">Compromis</span>;
      case 'Acte de vente': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-futura">Acte de vente</span>;
      case 'Contrat de Location': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-futura">Contrat Location</span>;
      case 'Propositions': return <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-futura">Proposition</span>;
      case 'Follow up': return <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-xs font-futura">Follow-up</span>;
      case 'Estimation': return <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-xs font-futura">Estimation</span>;
      case 'Prospection': return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-futura">Prospection</span>;
      case 'Admin': return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-futura">Admin</span>;
      default: return null;
    }
  };

  const handleActionConfirm = async () => {
    if (leadId && selectedAction) {
      try {
        let scheduledDateTime = undefined;
        if (actionDate) {
          const [hours, minutes] = actionTime.split(':').map(part => parseInt(part, 10));
          const dateTime = new Date(actionDate);
          dateTime.setHours(hours, minutes);
          scheduledDateTime = dateTime.toISOString();
        }
        
        await addActionToLead(leadId, {
          actionType: selectedAction,
          scheduledDate: scheduledDateTime,
          notes: actionNotes
        });
        
        toast({
          title: "Action ajoutée",
          description: `${selectedAction} a été ajouté${
            scheduledDateTime ? ` pour le ${format(new Date(scheduledDateTime), 'dd/MM/yyyy à HH:mm')}` : ''
          }`
        });
        
        setIsActionDialogOpen(false);
        
        navigate(`/leads/${leadId}`);
      } catch (error) {
        console.error("Error in handleActionConfirm:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'ajouter l'action."
        });
      }
    }
  };

  return (
    <div className="relative">
      <TooltipProvider>
        <div className="flex items-center gap-2 mb-2">
          {phone && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-loro-100 text-chocolate-dark border border-white hover:bg-loro-200 transition-colors"
                    onClick={handlePhoneClick}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Appeler {phone}</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-loro-100 text-chocolate-dark border border-white hover:bg-loro-200 transition-colors"
                    onClick={handleWhatsAppClick}
                  >
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
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Contacter via WhatsApp</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
          {email && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-loro-100 text-chocolate-dark border border-white hover:bg-loro-200 transition-colors"
                  onClick={handleEmailClick}
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Envoyer un email</p>
              </TooltipContent>
            </Tooltip>
          )}
          {leadId && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-loro-100 text-chocolate-dark border border-white hover:bg-loro-200 transition-colors"
                  onClick={handleAddAction}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ajouter une action</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>

      {isActionDialogOpen && (
        <ActionDialog
          isOpen={isActionDialogOpen}
          onClose={() => setIsActionDialogOpen(false)}
          selectedAction={selectedAction}
          setSelectedAction={setSelectedAction}
          actionDate={actionDate}
          setActionDate={setActionDate}
          actionTime={actionTime}
          setActionTime={setActionTime}
          actionNotes={actionNotes}
          setActionNotes={setActionNotes}
          onConfirm={handleActionConfirm}
          getActionTypeIcon={getActionTypeIcon}
        />
      )}
    </div>
  );
};

export default ContactInfo;
