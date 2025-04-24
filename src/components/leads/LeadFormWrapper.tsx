
import React, { useEffect } from 'react';
import LeadForm from '@/components/leads/LeadForm';
import { LeadDetailed } from '@/types/lead';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LeadFormWrapperProps {
  onSubmit: (data: LeadDetailed) => void;
  onCancel: () => void;
  adminAssignedAgent?: string | undefined;
  isSubmitting: boolean;
  currentUserTeamId?: string | undefined;
  enforceRlsRules?: boolean;
  lead?: LeadDetailed;
}

const LeadFormWrapper: React.FC<LeadFormWrapperProps> = ({
  onSubmit,
  onCancel,
  adminAssignedAgent,
  isSubmitting,
  currentUserTeamId,
  lead,
  enforceRlsRules = true, // Default to true for RLS enforcement
}) => {
  const { isAdmin, isCommercial, user } = useAuth();
  
  console.log("[LeadFormWrapper] Render - isAdmin:", isAdmin);
  console.log("[LeadFormWrapper] adminAssignedAgent:", adminAssignedAgent);
  console.log("[LeadFormWrapper] currentUserTeamId:", currentUserTeamId);
  console.log("[LeadFormWrapper] Lead ID:", lead?.id);
  console.log("[LeadFormWrapper] enforceRlsRules:", enforceRlsRules);
  
  // Vérifier les permissions si c'est un lead existant
  useEffect(() => {
    const checkPermissions = async () => {
      if (lead?.id && isCommercial && !isAdmin) {
        try {
          // Récupérer l'ID du commercial connecté
          const { data } = await supabase
            .from('team_members')
            .select('id')
            .eq('email', user?.email)
            .single();
            
          if (data && lead.assignedTo !== data.id) {
            toast({
              variant: "destructive",
              title: "Accès refusé",
              description: "Vous n'êtes pas autorisé à modifier ce lead car il est assigné à un autre commercial.",
              duration: 5000,
            });
            // Retourner à la page précédente
            onCancel();
          }
        } catch (error) {
          console.error("Erreur lors de la vérification des permissions:", error);
        }
      }
    };
    
    if (enforceRlsRules) {
      checkPermissions();
    }
  }, [lead?.id, isCommercial, isAdmin, user?.email, enforceRlsRules]);
  
  return (
    <div className="luxury-card p-6 border-loro-sand">
      <LeadForm 
        lead={lead}
        onSubmit={onSubmit} 
        onCancel={onCancel}
        adminAssignedAgent={adminAssignedAgent}
        isSubmitting={isSubmitting}
        currentUserTeamId={currentUserTeamId}
        enforceRlsRules={enforceRlsRules}
      />
    </div>
  );
};

export default LeadFormWrapper;
