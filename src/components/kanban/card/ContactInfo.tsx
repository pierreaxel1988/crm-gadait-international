
import React, { useState } from 'react';
import { Mail, Phone, PlusCircle, MessageSquare } from 'lucide-react';
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
    e.stopPropagation(); // Prevent card click when clicking on email
    window.location.href = `mailto:${email}`;
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking on phone
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (phone) {
      // Format phone number for WhatsApp (remove spaces and any non-digit characters except +)
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
        
        // Navigate to the lead detail page to see the updated actions
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                onClick={handleEmailClick}
              >
                <Mail className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Envoyer un email à {email}</p>
            </TooltipContent>
          </Tooltip>
          
          {phone && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
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
                    className="h-8 w-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    onClick={handleWhatsAppClick}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Contacter via WhatsApp</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
          
          {leadId && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
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
