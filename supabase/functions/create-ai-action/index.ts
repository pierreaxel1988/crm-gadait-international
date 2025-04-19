
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    // Get request body
    const { action_type, scheduled_date, notes, assigned_to, lead_id } = await req.json();
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Validate input
    if (!action_type || !scheduled_date || !notes || !assigned_to) {
      throw new Error('Missing required fields for action creation');
    }
    
    // Generate unique ID for action
    const actionId = crypto.randomUUID();
    const currentDate = new Date().toISOString();
    
    // If lead_id is provided, add action to that lead
    if (lead_id) {
      // First get the lead to update its action history
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('action_history')
        .eq('id', lead_id)
        .single();
        
      if (leadError) {
        throw new Error(`Error fetching lead: ${leadError.message}`);
      }
      
      if (!lead) {
        throw new Error('Lead not found');
      }
      
      // Create the new action
      const newAction = {
        id: actionId,
        actionType: action_type,
        scheduledDate: scheduled_date,
        notes,
        createdAt: currentDate
      };
      
      // Update the lead with the new action
      const actionHistory = Array.isArray(lead.action_history) ? lead.action_history : [];
      const updatedActionHistory = [...actionHistory, newAction];
      
      const { error: updateError } = await supabase
        .from('leads')
        .update({ 
          action_history: updatedActionHistory,
          assigned_to,
          lastContactedAt: currentDate
        })
        .eq('id', lead_id);
        
      if (updateError) {
        throw new Error(`Error updating lead: ${updateError.message}`);
      }
    } else {
      // If no lead_id is provided, create a standalone action in a separate table
      // This is optional and depends on your database structure
      const { error: insertError } = await supabase
        .from('standalone_actions')
        .insert({
          id: actionId,
          action_type,
          scheduled_date,
          notes,
          assigned_to,
          created_at: currentDate
        });
        
      if (insertError) {
        throw new Error(`Error creating standalone action: ${insertError.message}`);
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, actionId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-ai-action function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
