import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting inactive leads check...');

    // Période d'inactivité à surveiller (7 jours)
    const inactivityDays = 7;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - inactivityDays);

    // Récupérer tous les leads avec au moins un clic
    const { data: leadsWithClicks, error: leadsError } = await supabase
      .from('property_clicks')
      .select(`
        lead_id,
        clicked_at,
        leads:lead_id (
          id,
          name,
          assigned_to,
          status
        )
      `)
      .order('clicked_at', { ascending: false });

    if (leadsError) {
      console.error('Error fetching leads with clicks:', leadsError);
      throw leadsError;
    }

    // Grouper par lead_id et trouver la dernière activité
    const leadActivityMap = new Map();
    
    for (const click of leadsWithClicks || []) {
      const leadId = click.lead_id;
      if (!leadActivityMap.has(leadId)) {
        leadActivityMap.set(leadId, {
          leadId,
          lastActivity: new Date(click.clicked_at),
          lead: click.leads
        });
      }
    }

    console.log(`Found ${leadActivityMap.size} leads with activity`);

    // Identifier les leads inactifs
    const inactiveLeads = [];
    for (const [leadId, data] of leadActivityMap.entries()) {
      if (data.lastActivity < cutoffDate && data.lead.assigned_to) {
        inactiveLeads.push(data);
      }
    }

    console.log(`Found ${inactiveLeads.length} inactive leads`);

    // Créer des notifications pour les leads inactifs
    let notificationsCreated = 0;
    
    for (const inactive of inactiveLeads) {
      const lead = inactive.lead as any;
      
      // Vérifier si une notification existe déjà pour ce lead
      const { data: existingNotif } = await supabase
        .from('notifications')
        .select('id')
        .eq('lead_id', lead.id)
        .eq('type', 'inactive_lead')
        .gte('created_at', cutoffDate.toISOString())
        .single();

      if (existingNotif) {
        console.log(`Notification already exists for lead ${lead.id}`);
        continue;
      }

      const daysSinceActivity = Math.floor(
        (Date.now() - inactive.lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Créer la notification
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: lead.assigned_to,
          lead_id: lead.id,
          type: 'inactive_lead',
          title: 'Lead inactif détecté ⏰',
          message: `Le lead "${lead.name}" n'a consulté aucune propriété depuis ${daysSinceActivity} jours. Il serait judicieux de le relancer.`,
          metadata: {
            days_inactive: daysSinceActivity,
            last_activity: inactive.lastActivity.toISOString()
          }
        });

      if (notifError) {
        console.error(`Error creating notification for lead ${lead.id}:`, notifError);
      } else {
        notificationsCreated++;
        console.log(`Created notification for inactive lead: ${lead.name}`);
      }
    }

    // Nettoyer les anciennes notifications (plus de 30 jours)
    const { error: cleanupError } = await supabase
      .rpc('cleanup_old_notifications');

    if (cleanupError) {
      console.error('Error cleaning up old notifications:', cleanupError);
    }

    const result = {
      success: true,
      checked: leadActivityMap.size,
      inactive: inactiveLeads.length,
      notifications_created: notificationsCreated,
      timestamp: new Date().toISOString()
    };

    console.log('Inactive leads check completed:', result);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in check-inactive-leads function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
