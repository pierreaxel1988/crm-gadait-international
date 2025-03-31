
import React, { useEffect, useState } from 'react';
import { Mail, MapPin, Phone, User } from 'lucide-react';
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail mr-1">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <span>{lead.email}</span>
          </div>
          {lead.phone && (
            <div className="flex items-center text-sm text-muted-foreground mt-1 gap-2">
              <div className="flex items-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone mr-1">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>{lead.phone}</span>
              </div>
              <button 
                onClick={handleWhatsAppClick}
                className="h-7 w-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                aria-label="Contacter via WhatsApp"
              >
                <img 
                  src="/lovable-uploads/0098d7ef-b8b2-4340-bc84-0521a2eb5245.png" 
                  alt="WhatsApp"
                  className="h-4 w-4"
                />
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
