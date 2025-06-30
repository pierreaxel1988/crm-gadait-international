import React, { useEffect, useState } from 'react';
import { X, Phone, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface NewLead {
  id: string;
  name: string;
  created_at: string;
}
export const NewLeadsAlert = () => {
  const [visible, setVisible] = useState(false);
  const [newLeads, setNewLeads] = useState<NewLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastShown, setLastShown] = useState(0);
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const NOTIFICATION_INTERVAL = 15 * 60 * 1000; // 15 minutes in milliseconds

  const fetchNewLeads = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // First, find the team member ID of the current user
      const {
        data: teamMemberData,
        error: teamMemberError
      } = await supabase.from('team_members').select('id').eq('email', user.email).single();
      if (teamMemberError) {
        console.error('Error fetching team member:', teamMemberError);
        setLoading(false);
        return;
      }
      if (!teamMemberData) {
        console.log('No team member found for the current user');
        setLoading(false);
        return;
      }

      // Then fetch new leads assigned to this team member
      const {
        data: leadsData,
        error: leadsError
      } = await supabase.from('leads').select('id, name, created_at').eq('assigned_to', teamMemberData.id).eq('status', 'New').order('created_at', {
        ascending: false
      });
      if (leadsError) {
        console.error('Error fetching leads:', leadsError);
        setLoading(false);
        return;
      }
      setNewLeads(leadsData || []);

      // Only show notification if there are leads and it's time to show the notification again
      const currentTime = Date.now();
      if (leadsData && leadsData.length > 0 && currentTime - lastShown >= NOTIFICATION_INTERVAL) {
        setVisible(true);
        setLastShown(currentTime);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when component mounts
  useEffect(() => {
    if (user) {
      fetchNewLeads();
    }
  }, [user]);

  // Set up interval for checking leads every 15 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        fetchNewLeads();
      }
    }, NOTIFICATION_INTERVAL);
    return () => clearInterval(interval);
  }, [user, lastShown]);

  // Set up a subscription for real-time updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('new-leads-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'leads',
      filter: `status=eq.New`
    }, payload => {
      console.log('Change received!', payload);
      fetchNewLeads();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  const handleDismiss = () => {
    setVisible(false);
    // Update last shown time so it will show again after the interval
    setLastShown(Date.now() - NOTIFICATION_INTERVAL + 2 * 60 * 1000); // Show again in 2 minutes

    toast({
      title: "Notification masquée",
      description: `Vous pouvez toujours voir les nouveaux leads dans la colonne "Nouveaux" du pipeline.`
    });
  };
  const handleViewLead = (leadId: string) => {
    navigate(`/leads/${leadId}?tab=actions`);
    setVisible(false);
  };
  if (!visible || loading || newLeads.length === 0) return null;
  return <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in-0 slide-in-from-top-5 duration-500 border border-red-100">
        {/* Header avec gradient plus élégant */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-50 via-red-25 to-orange-50 border-b border-red-100/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <Bell className="h-5 w-5 text-white" strokeWidth={2} />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800 font-futura">
                  Nouveaux leads à traiter immédiatement
                </h3>
                <p className="text-sm text-red-600/80 font-futura">
                  Action requise
                </p>
              </div>
            </div>
            <button onClick={handleDismiss} className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-100/50">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Corps de la notification */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 font-medium text-center">
              Vous avez <span className="text-red-600 font-semibold">{newLeads.length}</span> nouveau{newLeads.length > 1 ? 'x' : ''} lead{newLeads.length > 1 ? 's' : ''} à contacter immédiatement.
            </p>
          </div>
          
          {/* Liste des leads avec design amélioré */}
          <div className="space-y-3 max-h-60 overflow-auto">
            {newLeads.map((lead, index) => <div key={lead.id} className="bg-gradient-to-r from-gray-50 to-gray-25 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300" style={{
            animationDelay: `${index * 100}ms`
          }}>
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h4 className="text-gray-800 font-futura mb-1 font-medium text-lg">
                      {lead.name}
                    </h4>
                    <p className="text-sm text-gray-500 font-futura">
                      Créé le {new Date(lead.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                    </p>
                  </div>
                  <Button onClick={() => handleViewLead(lead.id)} className="bg-loro-navy hover:bg-loro-navy/90 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2 font-futura">
                    <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center">
                      <Phone className="h-4 w-4 text-green-600" strokeWidth={2.5} />
                    </div>
                    <span>Contacter</span>
                  </Button>
                </div>
              </div>)}
          </div>
          
          {/* Boutons d'action avec design amélioré */}
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={handleDismiss} className="border-gray-300 hover:bg-gray-50 transition-colors px-6 py-2 font-futura rounded-lg">
              Masquer
            </Button>
            <Button onClick={() => navigate('/pipeline')} className="bg-loro-terracotta hover:bg-loro-terracotta/90 text-white px-6 py-2 transition-colors font-futura rounded-lg shadow-md hover:shadow-lg">
              Voir le pipeline
            </Button>
          </div>
        </div>
      </div>
    </div>;
};
export default NewLeadsAlert;
