
import React, { useEffect, useState } from 'react';
import { Mail, MapPin, Phone, MessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import StatusBadge, { LeadStatus } from '@/components/common/StatusBadge';
import TagBadge, { LeadTag } from '@/components/common/TagBadge';
import CustomButton from '@/components/ui/CustomButton';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  status: LeadStatus;
  tags: LeadTag[];
  assignedTo?: string;
  createdAt: string;
  lastContactedAt?: string;
}

interface LeadCardProps {
  lead: Lead;
  className?: string;
  onView?: () => void;
  onContact?: () => void;
}

const LeadCard = ({ lead, className, onView, onContact }: LeadCardProps) => {
  const navigate = useNavigate();
  const [assignedToName, setAssignedToName] = useState<string>('Non assigné');

  useEffect(() => {
    const fetchTeamMemberName = async () => {
      if (lead.assignedTo) {
        try {
          const { data, error } = await supabase
            .from('team_members')
            .select('name')
            .eq('id', lead.assignedTo)
            .single();
            
          if (error) {
            console.error('Error fetching team member name:', error);
            return;
          }
          
          if (data && data.name) {
            setAssignedToName(data.name);
          }
        } catch (error) {
          console.error('Unexpected error fetching team member name:', error);
        }
      }
    };

    fetchTeamMemberName();
  }, [lead.assignedTo]);

  const handleCardClick = () => {
    navigate(`/leads/${lead.id}?tab=criteria`);
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche le clic du bouton de déclencher le clic de la carte
    if (onView) {
      onView();
    } else {
      navigate(`/leads/${lead.id}?tab=criteria`);
    }
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche le clic du bouton de déclencher le clic de la carte
    if (onContact) {
      onContact();
    }
  };
  
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (lead.phone) {
      // Format phone number for WhatsApp (remove spaces and any non-digit characters except +)
      const cleanedPhone = lead.phone.replace(/[^\d+]/g, '');
      window.open(`https://wa.me/${cleanedPhone}`, '_blank');
    }
  };

  return (
    <div 
      className={cn('luxury-card p-5 scale-in cursor-pointer hover:shadow-md transition-shadow duration-200', className)}
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-foreground">{lead.name}</h3>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <Mail className="h-3.5 w-3.5 mr-1" />
            <span>{lead.email}</span>
          </div>
          {lead.phone && (
            <div className="flex items-center text-sm text-muted-foreground mt-1 gap-2">
              <div className="flex items-center">
                <Phone className="h-3.5 w-3.5 mr-1" />
                <span>{lead.phone}</span>
              </div>
              <button 
                onClick={handleWhatsAppClick}
                className="p-1 rounded-full bg-emerald-100/50 text-emerald-600 hover:bg-emerald-100"
                aria-label="Contacter via WhatsApp"
              >
                <MessageSquare className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {lead.location && (
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span>{lead.location}</span>
            </div>
          )}
        </div>
        <StatusBadge status={lead.status} />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {lead.tags.map((tag) => (
          <TagBadge key={tag} tag={tag} />
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="h-3.5 w-3.5 mr-1" />
            <span>
              {assignedToName}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {lead.lastContactedAt
              ? `Dernier contact: ${lead.lastContactedAt}`
              : `Créé le: ${lead.createdAt}`}
          </div>
        </div>
      </div>

      <div className="mt-4 flex space-x-2">
        <CustomButton 
          variant="outline" 
          className="w-full text-chocolate-dark border-chocolate-dark hover:bg-chocolate-dark/10"
          onClick={handleViewClick}
        >
          Voir
        </CustomButton>
        <CustomButton 
          variant="chocolate"
          className="w-full"
          onClick={handleContactClick}
        >
          Contacter
        </CustomButton>
      </div>
    </div>
  );
};

export default LeadCard;
