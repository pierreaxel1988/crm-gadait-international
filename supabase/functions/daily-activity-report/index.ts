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
  total_active: number;
  new_today: number;
  signed_today: number;
  in_negotiation: number;
}

interface AgentPerformance {
  agent_name: string;
  leads_actifs: number;
  actions_en_retard: number;
  hot_leads: number;
  no_response_leads: number;
}

// Helper function to get today's date at midnight in Paris timezone
function getTodayParis(): Date {
  const now = new Date();
  const parisTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Paris" }));
  parisTime.setHours(0, 0, 0, 0);
  return parisTime;
}

// Get agent performance stats (CEO table data)
async function getAgentPerformanceStats(): Promise<AgentPerformance[]> {
  const { data: leads, error } = await supabase
    .from("leads")
    .select(`
      id,
      assigned_to,
      tags,
      action_history,
      deleted_at,
      team_members!leads_assigned_to_fkey(name)
    `)
    .is("deleted_at", null);

  if (error) {
    console.error("Error fetching agent performance:", error);
    return [];
  }

  const agentStats: { [key: string]: AgentPerformance } = {};

  leads?.forEach((lead: any) => {
    const agentName = lead.team_members?.name || "Non assigné";
    
    if (!agentStats[agentName]) {
      agentStats[agentName] = {
        agent_name: agentName,
        leads_actifs: 0,
        actions_en_retard: 0,
        hot_leads: 0,
        no_response_leads: 0,
      };
    }

    // Count active leads
    agentStats[agentName].leads_actifs++;

    // Count Hot leads
    if (lead.tags && lead.tags.includes("Hot")) {
      agentStats[agentName].hot_leads++;
    }

    // Count No Response leads
    if (lead.tags && lead.tags.includes("No response")) {
      agentStats[agentName].no_response_leads++;
    }

    // Count overdue actions
    const actions = lead.action_history || [];
    actions.forEach((action: any) => {
      if (action.scheduledDate && !action.completedDate) {
        const scheduledDate = new Date(action.scheduledDate);
        const now = new Date();
        if (scheduledDate < now) {
          agentStats[agentName].actions_en_retard++;
        }
      }
    });
  });

  return Object.values(agentStats).sort((a, b) => 
    b.leads_actifs - a.leads_actifs
  );
}

async function getNewLeadsToday(): Promise<NewLeadStats[]> {
  const today = getTodayParis();
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
  const today = getTodayParis();

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
    const agentName = lead.team_members?.name || "Non assigné";
    
    history.forEach((action: any) => {
      if (!action.createdAt) return;
      
      const actionDate = new Date(action.createdAt);
      if (actionDate >= today) {
        // Status changes
        if (action.actionType === "status_change" && action.oldStatus && action.newStatus) {
          changes.push({
            lead_name: lead.name,
            agent_name: agentName,
            old_status: action.oldStatus,
            new_status: action.newStatus,
            changed_at: action.createdAt,
          });
        }
        // Tags added/removed
        else if (action.actionType === "tag_change") {
          const oldTags = action.oldTags || [];
          const newTags = action.newTags || [];
          const added = newTags.filter((t: string) => !oldTags.includes(t));
          const removed = oldTags.filter((t: string) => !newTags.includes(t));
          
          if (added.length > 0) {
            changes.push({
              lead_name: lead.name,
              agent_name: agentName,
              old_status: "Tags",
              new_status: `Ajouté: ${added.join(", ")}`,
              changed_at: action.createdAt,
            });
          }
          if (removed.length > 0) {
            changes.push({
              lead_name: lead.name,
              agent_name: agentName,
              old_status: "Tags",
              new_status: `Retiré: ${removed.join(", ")}`,
              changed_at: action.createdAt,
            });
          }
        }
      }
    });
  });

  return changes;
}

async function getActionsCreatedToday(): Promise<ActionStats[]> {
  const today = getTodayParis();

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
      if (!action.createdAt) return;
      
      const actionDate = new Date(action.createdAt);
      if (actionDate >= today) {
        // Count all types of actions including status_change, tag_change, notes, calls, etc.
        const actionType = action.actionType || "other";
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
  const today = getTodayParis();
  const todayStr = today.toISOString();

  const { data: activeLeads, count: activeCount } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .is("deleted_at", null);

  const { data: newToday, count: newCount } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .gte("created_at", todayStr)
    .is("deleted_at", null);

  const { data: negotiationLeads, count: negCount } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .in("status", ["Négociation", "Proposition", "Acompte"])
    .is("deleted_at", null);

  const { data: signedToday, count: signedCount } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("status", "Signé")
    .gte("created_at", todayStr)
    .is("deleted_at", null);

  return {
    total_active: activeCount || 0,
    new_today: newCount || 0,
    in_negotiation: negCount || 0,
    signed_today: signedCount || 0,
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
  globalStats: GlobalStats,
  agentPerformance: AgentPerformance[]
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
      <div style="max-width: 900px; margin: 0 auto; padding: 40px 20px;">
        
        <!-- Header with Logo -->
        <div style="background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <div style="font-family: 'Futura', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 36px; font-weight: 500; color: white; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 20px;">GADAIT.</div>
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Rapport d'Activité Quotidien</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">${today}</p>
        </div>

        <!-- Main Content -->
        <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          
          <!-- Global Statistics -->
          <div style="background: white; border-radius: 12px; padding: 30px; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h2 style="color: #1e293b; margin: 0 0 25px 0; font-size: 22px; font-weight: 600; border-bottom: 3px solid #0ea5e9; padding-bottom: 15px;">📊 Vue d'ensemble</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 20px; border-radius: 10px; text-align: center;">
                <div style="color: rgba(255,255,255,0.9); font-size: 14px; margin-bottom: 8px;">Leads Actifs</div>
                <div style="color: white; font-size: 36px; font-weight: 700;">${globalStats.total_active}</div>
              </div>
              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 10px; text-align: center;">
                <div style="color: rgba(255,255,255,0.9); font-size: 14px; margin-bottom: 8px;">Nouveaux Aujourd'hui</div>
                <div style="color: white; font-size: 36px; font-weight: 700;">${globalStats.new_today}</div>
              </div>
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 20px; border-radius: 10px; text-align: center;">
                <div style="color: rgba(255,255,255,0.9); font-size: 14px; margin-bottom: 8px;">En Négociation</div>
                <div style="color: white; font-size: 36px; font-weight: 700;">${globalStats.in_negotiation}</div>
              </div>
              <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 20px; border-radius: 10px; text-align: center;">
                <div style="color: rgba(255,255,255,0.9); font-size: 14px; margin-bottom: 8px;">Signés Aujourd'hui</div>
                <div style="color: white; font-size: 36px; font-weight: 700;">${globalStats.signed_today}</div>
              </div>
            </div>
          </div>

          <!-- CEO Performance Table -->
          <div style="background: white; border-radius: 12px; padding: 30px; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h2 style="color: #1e293b; margin: 0 0 25px 0; font-size: 22px; font-weight: 600; border-bottom: 3px solid #0ea5e9; padding-bottom: 15px;">👥 Performance des Agents</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                  <th style="padding: 15px; text-align: left; font-weight: 600; color: #475569;">Agent</th>
                  <th style="padding: 15px; text-align: center; font-weight: 600; color: #475569;">Leads Actifs</th>
                  <th style="padding: 15px; text-align: center; font-weight: 600; color: #475569;">Actions en Retard</th>
                  <th style="padding: 15px; text-align: center; font-weight: 600; color: #475569;">🔥 Hot</th>
                  <th style="padding: 15px; text-align: center; font-weight: 600; color: #475569;">❌ No Response</th>
                </tr>
              </thead>
              <tbody>
                ${agentPerformance.map((agent, index) => `
                  <tr style="border-bottom: 1px solid #e2e8f0; background: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                    <td style="padding: 15px; font-weight: 500; color: #1e293b;">${agent.agent_name}</td>
                    <td style="padding: 15px; text-align: center; font-weight: 600; color: #3b82f6;">${agent.leads_actifs}</td>
                    <td style="padding: 15px; text-align: center; font-weight: 700; color: ${agent.actions_en_retard > 20 ? '#ef4444' : agent.actions_en_retard > 10 ? '#f59e0b' : '#10b981'};">
                      ${agent.actions_en_retard}
                    </td>
                    <td style="padding: 15px; text-align: center; font-weight: 600; color: #f97316;">${agent.hot_leads}</td>
                    <td style="padding: 15px; text-align: center; font-weight: 600; color: #64748b;">${agent.no_response_leads}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
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
              ⚡ Actions du Jour
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
    const [newLeads, statusChanges, actionsCreated, globalStats, agentPerformance] =
      await Promise.all([
        getNewLeadsToday(),
        getStatusChangesToday(),
        getActionsCreatedToday(),
        getGlobalStats(),
        getAgentPerformanceStats(),
      ]);

    const emailHtml = generateDailyReportHtml(
      newLeads,
      statusChanges,
      actionsCreated,
      globalStats,
      agentPerformance
    );

    const emailResponse = await resend.emails.send({
      from: FROM_EMAIL,
      to: [REPORT_EMAIL],
      subject: `📊 Rapport Quotidien GADAIT - ${new Date().toLocaleDateString("fr-FR")}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Rapport quotidien envoyé avec succès",
        stats: {
          new_leads: newLeads.length,
          status_changes: statusChanges.length,
          actions_created: actionsCreated.length,
          agents_performance: agentPerformance.length,
          global: globalStats,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in daily-activity-report function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
