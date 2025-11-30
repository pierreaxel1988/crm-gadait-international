import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

// --- ENV VARS ---
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!; // re_GW2FFSS5_...

const RESEND_FROM = Deno.env.get("RESEND_FROM")!; // "Gadait Team <team@gadait-international.com>"
const RESEND_TO = Deno.env.get("RESEND_TO")!;     // "pierre@gadait-international.com" (ou liste séparée par des virgules)

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

// On supporte plusieurs destinataires séparés par des virgules si tu veux élargir plus tard
const RECIPIENTS = RESEND_TO.split(",").map((email) => email.trim()).filter(Boolean);

interface WeeklyStats {
  newLeadsCount: number;
  signedLeadsCount: number;
  totalActionsCount: number;
  previousWeekNewLeads: number;
  previousWeekSignedLeads: number;
}

interface AgentWeeklyActivity {
  agent_id: string;
  agent_name: string;
  agent_email: string;
  new_leads_count: number;
  actions_count: number;
  signed_leads_count: number;
  connection_minutes: number;
}

interface DailyBreakdown {
  day_name: string;
  date: string;
  new_leads: number;
  actions: number;
}

interface ActionTypeBreakdown {
  action_type: string;
  count: number;
}

interface AgentActionBreakdown {
  agent_name: string;
  actions_by_type: ActionTypeBreakdown[];
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to get Paris timezone dates
function getParisDate(daysAgo: number = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const parisDate = new Date(date.toLocaleString("en-US", { timeZone: "Europe/Paris" }));
  parisDate.setHours(0, 0, 0, 0);
  return parisDate;
}

function getLastSunday(): Date {
  const today = getParisDate(0);
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const daysToLastSunday = dayOfWeek === 0 ? 7 : dayOfWeek;
  return getParisDate(daysToLastSunday);
}

function getWeekRange() {
  const lastSunday = getLastSunday();
  const endDate = new Date(lastSunday);
  endDate.setDate(endDate.getDate() + 7); // next Sunday

  return {
    startDate: lastSunday.toISOString(),
    endDate: endDate.toISOString(),
  };
}

function getPreviousWeekRange() {
  const lastSunday = getLastSunday();
  const previousSunday = new Date(lastSunday);
  previousSunday.setDate(previousSunday.getDate() - 7);

  return {
    startDate: previousSunday.toISOString(),
    endDate: lastSunday.toISOString(),
  };
}

async function getWeeklyStats(): Promise<WeeklyStats> {
  const { startDate, endDate } = getWeekRange();
  const { startDate: prevStartDate, endDate: prevEndDate } = getPreviousWeekRange();

  // Current week stats
  const { count: newLeadsCountRaw } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .gte("created_at", startDate)
    .lt("created_at", endDate)
    .is("deleted_at", null);

  const { count: signedLeadsCountRaw } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("status", "Signé")
    .gte("created_at", startDate)
    .lt("created_at", endDate)
    .is("deleted_at", null);

  // Previous week stats
  const { count: prevNewLeadsRaw } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .gte("created_at", prevStartDate)
    .lt("created_at", prevEndDate)
    .is("deleted_at", null);

  const { count: prevSignedLeadsRaw } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("status", "Signé")
    .gte("created_at", prevStartDate)
    .lt("created_at", prevEndDate)
    .is("deleted_at", null);

  // Count actions from action_history JSON field (pour la semaine en cours)
  const { data: leadsWithActions } = await supabase
    .from("leads")
    .select("action_history")
    .gte("created_at", startDate)
    .lt("created_at", endDate)
    .is("deleted_at", null);

  let totalActionsCount = 0;
  if (leadsWithActions) {
    for (const lead of leadsWithActions) {
      if (lead.action_history && Array.isArray(lead.action_history)) {
        totalActionsCount += lead.action_history.length;
      }
    }
  }

  return {
    newLeadsCount: newLeadsCountRaw ?? 0,
    signedLeadsCount: signedLeadsCountRaw ?? 0,
    totalActionsCount,
    previousWeekNewLeads: prevNewLeadsRaw ?? 0,
    previousWeekSignedLeads: prevSignedLeadsRaw ?? 0,
  };
}

async function getAgentWeeklyActivity(): Promise<AgentWeeklyActivity[]> {
  const { startDate, endDate } = getWeekRange();

  const { data: teamMembers } = await supabase
    .from("team_members")
    .select("id, name, email");

  if (!teamMembers) return [];

  const agentActivities: AgentWeeklyActivity[] = [];

  for (const member of teamMembers) {
    // New leads assigned to this agent
    const { count: newLeadsCountRaw } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("assigned_to", member.id)
      .gte("created_at", startDate)
      .lt("created_at", endDate)
      .is("deleted_at", null);

    // Signed leads by this agent
    const { count: signedLeadsCountRaw } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("assigned_to", member.id)
      .eq("status", "Signé")
      .gte("created_at", startDate)
      .lt("created_at", endDate)
      .is("deleted_at", null);

    // Actions by this agent (tous les leads de l'agent, puis filtrage par date en JS)
    const { data: leadsWithActions } = await supabase
      .from("leads")
      .select("action_history")
      .eq("assigned_to", member.id)
      .is("deleted_at", null);

    let actionsCount = 0;
    if (leadsWithActions) {
      for (const lead of leadsWithActions) {
        if (lead.action_history && Array.isArray(lead.action_history)) {
          const weekActions = lead.action_history.filter((action: any) => {
            const actionDate = new Date(action.date);
            return actionDate >= new Date(startDate) && actionDate < new Date(endDate);
          });
          actionsCount += weekActions.length;
        }
      }
    }

    // Connection time
    const { data: sessions } = await supabase
      .from("user_sessions")
      .select("session_duration")
      .eq("user_id", member.id)
      .gte("login_time", startDate)
      .lt("login_time", endDate);

    const connectionMinutes =
      sessions?.reduce((sum, s) => sum + (s.session_duration || 0), 0) || 0;

    agentActivities.push({
      agent_id: member.id,
      agent_name: member.name,
      agent_email: member.email,
      new_leads_count: newLeadsCountRaw ?? 0,
      actions_count: actionsCount,
      signed_leads_count: signedLeadsCountRaw ?? 0,
      connection_minutes: Math.round(connectionMinutes),
    });
  }

  return agentActivities.sort((a, b) => b.actions_count - a.actions_count);
}

async function getDailyBreakdown(): Promise<DailyBreakdown[]> {
  const { startDate, endDate } = getWeekRange();
  const dailyData: DailyBreakdown[] = [];

  const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(startDate);
    dayStart.setDate(dayStart.getDate() + i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const { count: newLeadsCountRaw } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .gte("created_at", dayStart.toISOString())
      .lt("created_at", dayEnd.toISOString())
      .is("deleted_at", null);

    const { data: leadsWithActions } = await supabase
      .from("leads")
      .select("action_history")
      .is("deleted_at", null);

    let actionsCount = 0;
    if (leadsWithActions) {
      for (const lead of leadsWithActions) {
        if (lead.action_history && Array.isArray(lead.action_history)) {
          const dayActions = lead.action_history.filter((action: any) => {
            const actionDate = new Date(action.date);
            return actionDate >= dayStart && actionDate < dayEnd;
          });
          actionsCount += dayActions.length;
        }
      }
    }

    dailyData.push({
      day_name: dayNames[dayStart.getDay()],
      date: dayStart.toLocaleDateString("fr-FR"),
      new_leads: newLeadsCountRaw ?? 0,
      actions: actionsCount,
    });
  }

  return dailyData;
}

async function getActionTypeBreakdown(): Promise<AgentActionBreakdown[]> {
  const { startDate, endDate } = getWeekRange();

  const { data: teamMembers } = await supabase
    .from("team_members")
    .select("id, name");

  if (!teamMembers) return [];

  const agentBreakdowns: AgentActionBreakdown[] = [];

  for (const member of teamMembers) {
    const { data: leadsWithActions } = await supabase
      .from("leads")
      .select("action_history")
      .eq("assigned_to", member.id)
      .is("deleted_at", null);

    const actionTypeCounts: { [key: string]: number } = {};

    if (leadsWithActions) {
      for (const lead of leadsWithActions) {
        if (lead.action_history && Array.isArray(lead.action_history)) {
          const weekActions = lead.action_history.filter((action: any) => {
            const actionDate = new Date(action.date);
            return actionDate >= new Date(startDate) && actionDate < new Date(endDate);
          });

          for (const action of weekActions) {
            const type = action.type || "Autre";
            actionTypeCounts[type] = (actionTypeCounts[type] || 0) + 1;
          }
        }
      }
    }

    const actions_by_type = Object.entries(actionTypeCounts)
      .map(([action_type, count]) => ({ action_type, count }))
      .sort((a, b) => b.count - a.count);

    if (actions_by_type.length > 0) {
      agentBreakdowns.push({
        agent_name: member.name,
        actions_by_type,
      });
    }
  }

  return agentBreakdowns;
}

function formatMinutesToHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h${mins.toString().padStart(2, "0")}`;
}

function getEvolutionEmoji(current: number, previous: number): string {
  if (current > previous) return "📈";
  if (current < previous) return "📉";
  return "➡️";
}

function getEvolutionPercentage(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "+100%" : "0%";
  const diff = ((current - previous) / previous) * 100;
  return diff > 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`;
}

async function generateWeeklyReportHtml(): Promise<string> {
  const weeklyStats = await getWeeklyStats();
  const agentActivities = await getAgentWeeklyActivity();
  const dailyBreakdown = await getDailyBreakdown();
  const actionBreakdown = await getActionTypeBreakdown();

  const { startDate } = getWeekRange();
  const weekStart = new Date(startDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const dateRange = `${weekStart.toLocaleDateString("fr-FR")} - ${weekEnd.toLocaleDateString(
    "fr-FR",
  )}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
    .stat-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; }
    .stat-value { font-size: 32px; font-weight: bold; color: #667eea; margin: 10px 0; }
    .stat-label { font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
    .evolution { font-size: 14px; margin-top: 5px; }
    .evolution.positive { color: #10b981; }
    .evolution.negative { color: #ef4444; }
    .section { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 25px; margin-bottom: 20px; }
    .section-title { font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1f2937; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f9fafb; padding: 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; }
    td { padding: 12px; border-bottom: 1px solid #f3f4f6; }
    tr:last-child td { border-bottom: none; }
    .rank { display: inline-block; width: 30px; height: 30px; line-height: 30px; text-align: center; border-radius: 50%; font-weight: bold; }
    .rank-1 { background: #ffd700; color: #000; }
    .rank-2 { background: #c0c0c0; color: #000; }
    .rank-3 { background: #cd7f32; color: #fff; }
    .rank-other { background: #e5e7eb; color: #6b7280; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .badge-success { background: #d1fae5; color: #065f46; }
    .badge-info { background: #dbeafe; color: #1e40af; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Rapport d'Activité Hebdomadaire</h1>
    <p>Gadait International CRM</p>
    <p>${dateRange}</p>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Nouveaux Leads</div>
      <div class="stat-value">${weeklyStats.newLeadsCount}</div>
      <div class="evolution ${weeklyStats.newLeadsCount >= weeklyStats.previousWeekNewLeads ? "positive" : "negative"}">
        ${getEvolutionEmoji(weeklyStats.newLeadsCount, weeklyStats.previousWeekNewLeads)}
        ${getEvolutionPercentage(weeklyStats.newLeadsCount, weeklyStats.previousWeekNewLeads)}
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Leads Signés</div>
      <div class="stat-value">${weeklyStats.signedLeadsCount}</div>
      <div class="evolution ${weeklyStats.signedLeadsCount >= weeklyStats.previousWeekSignedLeads ? "positive" : "negative"}">
        ${getEvolutionEmoji(weeklyStats.signedLeadsCount, weeklyStats.previousWeekSignedLeads)}
        ${getEvolutionPercentage(weeklyStats.signedLeadsCount, weeklyStats.previousWeekSignedLeads)}
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Actions Réalisées</div>
      <div class="stat-value">${weeklyStats.totalActionsCount}</div>
      <div class="evolution">Cette semaine</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">👥 Classement des Agents</div>
    <table>
      <thead>
        <tr>
          <th>Rang</th>
          <th>Agent</th>
          <th>Leads</th>
          <th>Actions</th>
          <th>Signés</th>
          <th>Temps</th>
        </tr>
      </thead>
      <tbody>
        ${agentActivities
          .map(
            (agent, index) => `
          <tr>
            <td>
              <span class="rank ${
                index === 0 ? "rank-1" : index === 1 ? "rank-2" : index === 2 ? "rank-3" : "rank-other"
              }">
                ${index + 1}
              </span>
            </td>
            <td><strong>${agent.agent_name}</strong></td>
            <td>${agent.new_leads_count}</td>
            <td><span class="badge badge-info">${agent.actions_count}</span></td>
            <td><span class="badge badge-success">${agent.signed_leads_count}</span></td>
            <td>${formatMinutesToHours(agent.connection_minutes)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">📅 Activité Quotidienne</div>
    <table>
      <thead>
        <tr>
          <th>Jour</th>
          <th>Date</th>
          <th>Nouveaux Leads</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${dailyBreakdown
          .map(
            (day) => `
          <tr>
            <td><strong>${day.day_name}</strong></td>
            <td>${day.date}</td>
            <td>${day.new_leads}</td>
            <td>${day.actions}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">⚡ Actions par Type et Agent</div>
    ${actionBreakdown
      .map(
        (agent) => `
      <div style="margin-bottom: 20px;">
        <h3 style="color: #374151; font-size: 16px; margin-bottom: 10px;">${agent.agent_name}</h3>
        <table>
          <thead>
            <tr>
              <th>Type d'Action</th>
              <th>Nombre</th>
            </tr>
          </thead>
          <tbody>
            ${agent.actions_by_type
              .map(
                (action) => `
              <tr>
                <td>${action.action_type}</td>
                <td><span class="badge badge-info">${action.count}</span></td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `,
      )
      .join("")}
  </div>

  <div class="footer">
    <p>Rapport généré automatiquement par Gadait CRM</p>
    <p>Pour toute question, contactez l'équipe technique</p>
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
    console.log("🚀 Generating weekly activity report...");

    const htmlContent = await generateWeeklyReportHtml();

    const { data, error } = await resend.emails.send({
      from: RESEND_FROM,
      to: RECIPIENTS,
      subject: "📊 Rapport Hebdomadaire - Gadait CRM",
      html: htmlContent,
    });

    if (error) {
      console.error("❌ Error sending email:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: error }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("✅ Weekly report sent successfully:", data);

    return new Response(
      JSON.stringify({ success: true, message: "Weekly report sent", data }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err: unknown) {
    console.error("❌ Error in weekly-activity-report:", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
};

serve(handler);
