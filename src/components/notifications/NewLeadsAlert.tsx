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
  return <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in-0 slide-in-from-top-5 duration-300">
        <div className="px-4 py-3 bg-gradient-to-r from-red-50 to-red-100 border-b border-red-100 flex justify-between items-center">
          <h3 className="text-lg font-medium text-red-800 flex items-center">
            <span className="relative flex mr-2">
              <Bell className="h-5 w-5 text-red-500" strokeWidth={2.5} />
              <span className="h-3 w-3 bg-red-500 rounded-full animate-ping absolute inline-flex right-0 top-0"></span>
              <span className="h-3 w-3 bg-red-500 rounded-full relative inline-flex right-0 top-0"></span>
            </span>
            Nouveaux leads à traiter immédiatement
          </h3>
          <button onClick={handleDismiss} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          <p className="mb-4 text-gray-700">
            Vous avez {newLeads.length} nouveau{newLeads.length > 1 ? 'x' : ''} lead{newLeads.length > 1 ? 's' : ''} à contacter immédiatement.
          </p>
          
          <div className="space-y-3 max-h-60 overflow-auto">
            {newLeads.map(lead => <div key={lead.id} className="border rounded-md p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-xs text-gray-500">
                      Créé le {new Date(lead.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                    </p>
                  </div>
                  <Button variant="default" size="sm" onClick={() => handleViewLead(lead.id)} className="garde le meme format que les tags dans la page /action c'est plus coherent bg-green-700 hover:bg-green-600 ajoute in liseraie elegant \n">
                    <span className="bg-white rounded-full p-1 mr-1 flex items-center justify-center">
                      <Phone className="h-3 w-3 text-green-600 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                    </span>
                    Contacter
                  </Button>
                </div>
              </div>)}
          </div>
          
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={handleDismiss} className="border-gray-300 hover:bg-gray-100 transition-colors">
              Masquer
            </Button>
            <Button onClick={() => navigate('/pipeline')} className="bg-loro-terracotta hover:bg-loro-terracotta/90 transition-colors">
              Voir le pipeline
            </Button>
          </div>
        </div>
      </div>
    </div>;
};
export default NewLeadsAlert;