import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

const REPORT_EMAIL = "pierre@gadait-international.com";
const FROM_EMAIL = "Gadait Team <team@gadait-international.com>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewLeadStats {
  agent_name: string;
  pipeline_type: string;
  count: number;
}

interface StatusChange {
  lead_name: string;
  agent_name: string;
  old_status: string;
  new_status: string;
  changed_at: string;
}

interface ActionStats {
  agent_name: string;
  action_type: string;
  count: number;
}

interface GlobalStats {
  total_active_leads: number;
  leads_in_negotiation: number;
  signed_deals: number;
}

async function getNewLeadsToday(): Promise<NewLeadStats[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const { data, error } = await supabase
    .from("leads")
    .select(`
      id,
      pipeline_type,
      created_at,
      assigned_to,
      team_members!leads_assigned_to_fkey(name)
    `)
    .gte("created_at", todayStr)
    .is("deleted_at", null);

  if (error) {
    console.error("Error fetching new leads:", error);
    return [];
  }

  // Group by agent and pipeline type
  const grouped: { [key: string]: number } = {};
  
  data?.forEach((lead: any) => {
    const agentName = lead.team_members?.name || "Non assigné";
    const pipelineType = lead.pipeline_type || "unknown";
    const key = `${agentName}|${pipelineType}`;
    grouped[key] = (grouped[key] || 0) + 1;
  });

  return Object.entries(grouped).map(([key, count]) => {
    const [agent_name, pipeline_type] = key.split("|");
    return { agent_name, pipeline_type, count };
  });
}

async function getStatusChangesToday(): Promise<StatusChange[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const { data, error } = await supabase
    .from("leads")
    .select(`
      id,
      name,
      action_history,
      assigned_to,
      team_members!leads_assigned_to_fkey(name)
    `)
    .is("deleted_at", null);

  if (error) {
    console.error("Error fetching leads for status changes:", error);
    return [];
  }

  const changes: StatusChange[] = [];

  data?.forEach((lead: any) => {
    if (!lead.action_history) return;

    const history = Array.isArray(lead.action_history) ? lead.action_history : [];
    
    history.forEach((action: any) => {
      if (!action.timestamp) return;
      
      const actionDate = new Date(action.timestamp);
      if (actionDate >= today) {
        // Status changes
        if (action.type === "status_change" && action.oldStatus && action.newStatus) {
          changes.push({
            lead_name: lead.name,
            agent_name: lead.team_members?.name || "Non assigné",
            old_status: action.oldStatus,
            new_status: action.newStatus,
            changed_at: action.timestamp,
          });
        }
        // Tags added/removed
        else if (action.type === "tag_change") {
          const oldTags = action.oldTags || [];
          const newTags = action.newTags || [];
          const added = newTags.filter((t: string) => !oldTags.includes(t));
          const removed = oldTags.filter((t: string) => !newTags.includes(t));
          
          if (added.length > 0) {
            changes.push({
              lead_name: lead.name,
              agent_name: lead.team_members?.name || "Non assigné",
              old_status: "Tags",
              new_status: `Ajouté: ${added.join(", ")}`,
              changed_at: action.timestamp,
            });
          }
          if (removed.length > 0) {
            changes.push({
              lead_name: lead.name,
              agent_name: lead.team_members?.name || "Non assigné",
              old_status: "Tags",
              new_status: `Retiré: ${removed.join(", ")}`,
              changed_at: action.timestamp,
            });
          }
        }
      }
    });
  });

  return changes;
}

async function getActionsCreatedToday(): Promise<ActionStats[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const { data, error } = await supabase
    .from("leads")
    .select(`
      id,
      action_history,
      assigned_to,
      team_members!leads_assigned_to_fkey(name)
    `)
    .is("deleted_at", null);

  if (error) {
    console.error("Error fetching leads for actions:", error);
    return [];
  }

  const actionsByAgent: { [key: string]: number } = {};

  data?.forEach((lead: any) => {
    if (!lead.action_history) return;

    const history = Array.isArray(lead.action_history) ? lead.action_history : [];
    const agentName = lead.team_members?.name || "Non assigné";
    
    history.forEach((action: any) => {
      if (!action.timestamp) return;
      
      const actionDate = new Date(action.timestamp);
      if (actionDate >= today) {
        // Count all types of actions including status_change, tag_change, notes, calls, etc.
        const actionType = action.type || "other";
        const key = `${agentName}|${actionType}`;
        actionsByAgent[key] = (actionsByAgent[key] || 0) + 1;
      }
    });
  });

  return Object.entries(actionsByAgent).map(([key, count]) => {
    const [agent_name, action_type] = key.split("|");
    return { agent_name, action_type, count };
  });
}

async function getGlobalStats(): Promise<GlobalStats> {
  const { data: activeLeads } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .is("deleted_at", null);

  const { data: negotiationLeads } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("status", "Négociation")
    .is("deleted_at", null);

  const { data: signedLeads } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("status", "Signé")
    .is("deleted_at", null);

  return {
    total_active_leads: activeLeads?.length || 0,
    leads_in_negotiation: negotiationLeads?.length || 0,
    signed_deals: signedLeads?.length || 0,
  };
}

function getPipelineTypeLabel(type: string): string {
  const labels: { [key: string]: string } = {
    purchase: "Achat",
    rental: "Location",
    owner: "Propriétaire",
    sale: "Vente",
  };
  return labels[type.toLowerCase()] || type;
}

function getActionTypeLabel(type: string): string {
  const labels: { [key: string]: string } = {
    status_change: "Changement de statut",
    tag_change: "Modification de tags",
    call: "Appel",
    email: "Email",
    meeting: "Rendez-vous",
    note: "Note",
    property_sent: "Propriété envoyée",
    comment: "Commentaire",
    task: "Tâche",
  };
  return labels[type] || type;
}

function generateDailyReportHtml(
  newLeads: NewLeadStats[],
  statusChanges: StatusChange[],
  actionsCreated: ActionStats[],
  globalStats: GlobalStats
): string {
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Group new leads by agent
  const leadsByAgent: { [agent: string]: { [type: string]: number } } = {};
  newLeads.forEach((stat) => {
    if (!leadsByAgent[stat.agent_name]) {
      leadsByAgent[stat.agent_name] = {};
    }
    leadsByAgent[stat.agent_name][stat.pipeline_type] = stat.count;
  });

  // Group actions by agent
  const actionsByAgent: { [agent: string]: { [type: string]: number } } = {};
  actionsCreated.forEach((stat) => {
    if (!actionsByAgent[stat.agent_name]) {
      actionsByAgent[stat.agent_name] = {};
    }
    actionsByAgent[stat.agent_name][stat.action_type] = stat.count;
  });

  const newLeadsHtml = Object.entries(leadsByAgent)
    .map(([agent, types]) => {
      const typesHtml = Object.entries(types)
        .map(([type, count]) => {
          return `<span style="display: inline-block; margin: 4px 8px; padding: 4px 12px; background: #f0f4f8; border-radius: 12px; font-size: 13px;">
            ${getPipelineTypeLabel(type)}: <strong>${count}</strong>
          </span>`;
        })
        .join("");
      
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <strong style="color: #1f2937;">${agent}</strong>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            ${typesHtml}
          </td>
        </tr>
      `;
    })
    .join("");

  const statusChangesHtml = statusChanges.length > 0
    ? statusChanges
        .map((change) => {
          return `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                <strong style="color: #1f2937;">${change.lead_name}</strong>
              </td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                ${change.agent_name}
              </td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #ef4444;">${change.old_status}</span> → 
                <span style="color: #10b981;">${change.new_status}</span>
              </td>
            </tr>
          `;
        })
        .join("")
    : '<tr><td colspan="3" style="padding: 20px; text-align: center; color: #9ca3af;">Aucun changement de statut aujourd\'hui</td></tr>';

  const actionsHtml = Object.entries(actionsByAgent)
    .map(([agent, actions]) => {
      const total = Object.values(actions).reduce((sum, count) => sum + count, 0);
      const actionsDetail = Object.entries(actions)
        .map(([type, count]) => {
          return `<span style="display: inline-block; margin: 4px 8px; padding: 4px 12px; background: #f0f4f8; border-radius: 12px; font-size: 13px;">
            ${getActionTypeLabel(type)}: <strong>${count}</strong>
          </span>`;
        })
        .join("");
      
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <strong style="color: #1f2937;">${agent}</strong>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
            <strong style="color: #0ea5e9; font-size: 16px;">${total}</strong>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            ${actionsDetail}
          </td>
        </tr>
      `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 800px; margin: 0 auto; padding: 40px 20px;">
        
        <!-- Header with Logo -->
        <div style="background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <div style="font-family: 'Futura', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 36px; font-weight: 500; color: white; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 20px;">GADAIT.</div>
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Rapport d'Activité Quotidien</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">${today}</p>
        </div>

        <!-- Main Content -->
        <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          
          <!-- Global Stats -->
          <div style="display: flex; gap: 20px; margin-bottom: 40px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 200px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 24px; border-radius: 12px; border-left: 4px solid #0ea5e9;">
              <div style="color: #0369a1; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Leads Actifs</div>
              <div style="color: #0c4a6e; font-size: 32px; font-weight: 700;">${globalStats.total_active_leads}</div>
            </div>
            <div style="flex: 1; min-width: 200px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 24px; border-radius: 12px; border-left: 4px solid #f59e0b;">
              <div style="color: #92400e; font-size: 14px; font-weight: 600; margin-bottom: 8px;">En Négociation</div>
              <div style="color: #78350f; font-size: 32px; font-weight: 700;">${globalStats.leads_in_negotiation}</div>
            </div>
            <div style="flex: 1; min-width: 200px; background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); padding: 24px; border-radius: 12px; border-left: 4px solid #10b981;">
              <div style="color: #065f46; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Signés</div>
              <div style="color: #064e3b; font-size: 32px; font-weight: 700;">${globalStats.signed_deals}</div>
            </div>
          </div>

          <!-- New Leads Section -->
          <div style="margin-bottom: 40px;">
            <h2 style="color: #1f2937; font-size: 22px; font-weight: 600; margin: 0 0 20px 0; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb;">
              📥 Nouveaux Leads
            </h2>
            ${newLeads.length > 0 ? `
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f9fafb;">
                    <th style="padding: 12px; text-align: left; font-size: 13px; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Agent</th>
                    <th style="padding: 12px; text-align: left; font-size: 13px; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Répartition</th>
                  </tr>
                </thead>
                <tbody>
                  ${newLeadsHtml}
                </tbody>
              </table>
            ` : '<p style="color: #9ca3af; text-align: center; padding: 20px;">Aucun nouveau lead aujourd\'hui</p>'}
          </div>

          <!-- Status Changes Section -->
          <div style="margin-bottom: 40px;">
            <h2 style="color: #1f2937; font-size: 22px; font-weight: 600; margin: 0 0 20px 0; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb;">
              🔄 Mouvements dans le Pipeline
            </h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f9fafb;">
                  <th style="padding: 12px; text-align: left; font-size: 13px; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Lead</th>
                  <th style="padding: 12px; text-align: left; font-size: 13px; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Agent</th>
                  <th style="padding: 12px; text-align: left; font-size: 13px; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Changement</th>
                </tr>
              </thead>
              <tbody>
                ${statusChangesHtml}
              </tbody>
            </table>
          </div>

          <!-- Actions Created Section -->
          <div style="margin-bottom: 20px;">
            <h2 style="color: #1f2937; font-size: 22px; font-weight: 600; margin: 0 0 20px 0; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb;">
              ⚡ Actions Créées
            </h2>
            ${actionsCreated.length > 0 ? `
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f9fafb;">
                    <th style="padding: 12px; text-align: left; font-size: 13px; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Agent</th>
                    <th style="padding: 12px; text-align: center; font-size: 13px; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Total</th>
                    <th style="padding: 12px; text-align: left; font-size: 13px; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Détails</th>
                  </tr>
                </thead>
                <tbody>
                  ${actionsHtml}
                </tbody>
              </table>
            ` : '<p style="color: #9ca3af; text-align: center; padding: 20px;">Aucune action créée aujourd\'hui</p>'}
          </div>

        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 13px;">
          <p style="margin: 0;">Ce rapport est généré automatiquement chaque jour à 18h</p>
          <p style="margin: 8px 0 0 0;">© ${new Date().getFullYear()} Gadait International - Tous droits réservés</p>
        </div>

      </div>
    </body>
    </html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting daily activity report generation...");

    // Fetch all data
    const [newLeads, statusChanges, actionsCreated, globalStats] = await Promise.all([
      getNewLeadsToday(),
      getStatusChangesToday(),
      getActionsCreatedToday(),
      getGlobalStats(),
    ]);

    console.log("Data fetched:", {
      newLeads: newLeads.length,
      statusChanges: statusChanges.length,
      actionsCreated: actionsCreated.length,
      globalStats,
    });

    // Generate HTML
    const htmlContent = generateDailyReportHtml(
      newLeads,
      statusChanges,
      actionsCreated,
      globalStats
    );

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: FROM_EMAIL,
      to: [REPORT_EMAIL],
      subject: `📊 Rapport d'activité quotidien - ${new Date().toLocaleDateString("fr-FR")}`,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Daily report sent successfully",
        data: {
          newLeads: newLeads.length,
          statusChanges: statusChanges.length,
          actionsCreated: actionsCreated.length,
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in daily-activity-report function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
