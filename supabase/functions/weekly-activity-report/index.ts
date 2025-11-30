import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

// --- ENV VARS ---
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

const RESEND_FROM = Deno.env.get("RESEND_FROM")!; // "Gadait Team <team@gadait-international.com>"
const RESEND_TO = Deno.env.get("RESEND_TO")!; // "pierre@gadait-international.com"

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

const RECIPIENTS = RESEND_TO.split(",")
  .map((email) => email.trim())
  .filter(Boolean);

// ---- TYPES ----
interface WeeklyStats {
  newLeadsCount: number;
  previousWeekNewLeads: number;

  totalActionsCount: number;
  previousWeekActionsCount: number;

  compromisCount: number;
  acteVenteCount: number;
  contratLocationCount: number;
  visitesDoneCount: number;
}

interface AgentWeeklyActivity {
  agent_id: string;
  agent_name: string;
  agent_email: string;
  new_leads_count: number;
  actions_count: number;
  overdue_actions_count: number;
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

interface AgentPipelineStatsRow {
  agent_name: string;
  pipeline: string;
  total_actions: number;
  call: number;
  follow_up: number;
  visites_faites: number;
  visites_futures: number;
  estimation: number;
  propositions: number;
  prospection: number;
  compromis: number;
  acte_vente: number;
  contrat_location: number;
  overdue: number;
}

interface LeadResponseTime {
  agent_name: string;
  average_hours: number;
  lead_count: number;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ---- HELPERS ----

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

// Date d'action pour les stats (completed > scheduled > created > date)
function getActionStatDate(action: any): Date | null {
  const dateStr = action.completedDate || action.scheduledDate || action.createdAt || action.date;

  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d;
}

// Détecter les emails automatiques à exclure des stats commerciales
function isAutoEmail(actionTypeRaw: any): boolean {
  if (!actionTypeRaw) return false;
  const t = String(actionTypeRaw).toLowerCase();
  return t.startsWith("email auto");
}

function formatMinutesToHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h${mins.toString().padStart(2, "0")}`;
}

function formatHoursToHuman(hours: number): string {
  const h = Math.floor(hours);
  let m = Math.round((hours - h) * 60);
  if (m === 60) {
    m = 0;
    return `${h + 1}h00`;
  }
  return `${h}h${m.toString().padStart(2, "0")}`;
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

// ---- QUERIES ----

async function getWeeklyStats(): Promise<WeeklyStats> {
  const { startDate, endDate } = getWeekRange();
  const { startDate: prevStartDate, endDate: prevEndDate } = getPreviousWeekRange();

  const start = new Date(startDate);
  const end = new Date(endDate);
  const prevStart = new Date(prevStartDate);
  const prevEnd = new Date(prevEndDate);

  // Nouveaux leads (semaine & semaine précédente)
  const { count: newLeadsCountRaw } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .gte("created_at", startDate)
    .lt("created_at", endDate)
    .is("deleted_at", null);

  const { count: prevNewLeadsRaw } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .gte("created_at", prevStartDate)
    .lt("created_at", prevEndDate)
    .is("deleted_at", null);

  // Actions : on prend toutes les actions de tous les leads
  const { data: leadsWithActions } = await supabase.from("leads").select("action_history").is("deleted_at", null);

  let totalActionsCount = 0;
  let previousWeekActionsCount = 0;

  let compromisCount = 0;
  let acteVenteCount = 0;
  let contratLocationCount = 0;
  let visitesDoneCount = 0;

  if (leadsWithActions) {
    for (const lead of leadsWithActions) {
      if (lead.action_history && Array.isArray(lead.action_history)) {
        for (const action of lead.action_history) {
          const type = (action.actionType || action.type || "").toString();
          if (isAutoEmail(type)) continue; // ❌ on exclut les Email Auto J+...

          const statDate = getActionStatDate(action);
          if (!statDate) continue;

          // Semaine en cours
          if (statDate >= start && statDate < end) {
            totalActionsCount++;

            const t = type.toLowerCase();
            if (t === "compromis") compromisCount++;
            if (t === "acte de vente") acteVenteCount++;
            if (t === "contrat de location") contratLocationCount++;

            // Visites réalisées = completedDate dans la semaine
            if (t === "visites") {
              if (action.completedDate) {
                const done = new Date(action.completedDate);
                if (!isNaN(done.getTime()) && done >= start && done < end) {
                  visitesDoneCount++;
                }
              }
            }
          }

          // Semaine précédente (pour l'évolution des actions)
          if (statDate >= prevStart && statDate < prevEnd) {
            previousWeekActionsCount++;
          }
        }
      }
    }
  }

  return {
    newLeadsCount: newLeadsCountRaw ?? 0,
    previousWeekNewLeads: prevNewLeadsRaw ?? 0,
    totalActionsCount,
    previousWeekActionsCount,
    compromisCount,
    acteVenteCount,
    contratLocationCount,
    visitesDoneCount,
  };
}

async function getAgentWeeklyActivity(): Promise<AgentWeeklyActivity[]> {
  const { startDate, endDate } = getWeekRange();
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  const { data: teamMembers } = await supabase.from("team_members").select("id, name, email");

  if (!teamMembers) return [];

  const agentActivities: AgentWeeklyActivity[] = [];

  for (const member of teamMembers) {
    // Nouveaux leads de la semaine pour l'agent
    const { count: newLeadsCountRaw } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("assigned_to", member.id)
      .gte("created_at", startDate)
      .lt("created_at", endDate)
      .is("deleted_at", null);

    // Actions commerciales par cet agent
    const { data: leadsWithActions } = await supabase
      .from("leads")
      .select("action_history")
      .eq("assigned_to", member.id)
      .is("deleted_at", null);

    let actionsCount = 0;
    let overdueCount = 0;

    if (leadsWithActions) {
      for (const lead of leadsWithActions) {
        if (lead.action_history && Array.isArray(lead.action_history)) {
          for (const action of lead.action_history) {
            const type = (action.actionType || action.type || "").toString();
            if (isAutoEmail(type)) continue;

            const statDate = getActionStatDate(action);
            if (!statDate) continue;

            if (statDate >= start && statDate < end) {
              actionsCount++;
            }

            // Retard : action programmée dans le passé mais pas complétée
            if (action.scheduledDate && !action.completedDate) {
              const sched = new Date(action.scheduledDate);
              if (!isNaN(sched.getTime()) && sched < now) {
                overdueCount++;
              }
            }
          }
        }
      }
    }

    agentActivities.push({
      agent_id: member.id,
      agent_name: member.name,
      agent_email: member.email,
      new_leads_count: newLeadsCountRaw ?? 0,
      actions_count: actionsCount,
      overdue_actions_count: overdueCount,
    });
  }

  return agentActivities.sort((a, b) => b.actions_count - a.actions_count);
}

async function getDailyBreakdown(): Promise<DailyBreakdown[]> {
  const { startDate } = getWeekRange();
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

    const { data: leadsWithActions } = await supabase.from("leads").select("action_history").is("deleted_at", null);

    let actionsCount = 0;
    if (leadsWithActions) {
      for (const lead of leadsWithActions) {
        if (lead.action_history && Array.isArray(lead.action_history)) {
          for (const action of lead.action_history) {
            const type = (action.actionType || action.type || "").toString();
            if (isAutoEmail(type)) continue;

            const statDate = getActionStatDate(action);
            if (!statDate) continue;

            if (statDate >= dayStart && statDate < dayEnd) {
              actionsCount++;
            }
          }
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
  const start = new Date(startDate);
  const end = new Date(endDate);

  const { data: teamMembers } = await supabase.from("team_members").select("id, name");

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
          for (const action of lead.action_history) {
            const type = (action.actionType || action.type || "").toString();
            if (isAutoEmail(type)) continue;

            const statDate = getActionStatDate(action);
            if (!statDate) continue;

            if (statDate >= start && statDate < end) {
              const key = type || "Autre";
              actionTypeCounts[key] = (actionTypeCounts[key] || 0) + 1;
            }
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

async function getAgentPipelineActionStats(): Promise<AgentPipelineStatsRow[]> {
  const { startDate, endDate } = getWeekRange();
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  const { data: teamMembers } = await supabase.from("team_members").select("id, name");

  const nameById = new Map<string, string>();
  teamMembers?.forEach((m: any) => nameById.set(m.id, m.name));

  const { data: leads } = await supabase
    .from("leads")
    .select("assigned_to, pipeline_type, action_history")
    .is("deleted_at", null);

  const rowsMap = new Map<string, AgentPipelineStatsRow>();

  if (!leads) return [];

  for (const lead of leads) {
    const agentId = lead.assigned_to;
    const pipeline = lead.pipeline_type;
    if (!agentId || !pipeline) continue;

    const agentName = nameById.get(agentId) || "Agent inconnu";
    const key = `${agentId}_${pipeline}`;

    if (!rowsMap.has(key)) {
      rowsMap.set(key, {
        agent_name: agentName,
        pipeline,
        total_actions: 0,
        call: 0,
        follow_up: 0,
        visites_faites: 0,
        visites_futures: 0,
        estimation: 0,
        propositions: 0,
        prospection: 0,
        compromis: 0,
        acte_vente: 0,
        contrat_location: 0,
        overdue: 0,
      });
    }

    const row = rowsMap.get(key)!;

    if (lead.action_history && Array.isArray(lead.action_history)) {
      for (const action of lead.action_history) {
        const typeRaw = (action.actionType || action.type || "").toString();
        if (isAutoEmail(typeRaw)) continue;

        const type = typeRaw.toLowerCase();
        const statDate = getActionStatDate(action);
        if (!statDate) continue;

        const inWeek = statDate >= start && statDate < end;
        if (!inWeek) {
          // même si l'action n'est pas dans la semaine, elle peut être en retard
          if (action.scheduledDate && !action.completedDate) {
            const sched = new Date(action.scheduledDate);
            if (!isNaN(sched.getTime()) && sched < now) {
              row.overdue++;
            }
          }
          continue;
        }

        row.total_actions++;

        if (type === "call") row.call++;
        else if (type === "follow up") row.follow_up++;
        else if (type === "estimation") row.estimation++;
        else if (type === "propositions") row.propositions++;
        else if (type === "prospection") row.prospection++;
        else if (type === "compromis") row.compromis++;
        else if (type === "acte de vente") row.acte_vente++;
        else if (type === "contrat de location") row.contrat_location++;
        else if (type === "visites") {
          if (action.completedDate) {
            const done = new Date(action.completedDate);
            if (!isNaN(done.getTime()) && done >= start && done < end) {
              row.visites_faites++;
            }
          } else if (action.scheduledDate) {
            const sched = new Date(action.scheduledDate);
            if (!isNaN(sched.getTime()) && sched >= start && sched < end) {
              row.visites_futures++;
            }
          }
        }

        // Retards
        if (action.scheduledDate && !action.completedDate) {
          const sched = new Date(action.scheduledDate);
          if (!isNaN(sched.getTime()) && sched < now) {
            row.overdue++;
          }
        }
      }
    }
  }

  const rows = Array.from(rowsMap.values());
  rows.sort((a, b) => {
    if (a.agent_name === b.agent_name) {
      return a.pipeline.localeCompare(b.pipeline);
    }
    return a.agent_name.localeCompare(b.agent_name);
  });

  return rows;
}

async function getLeadResponseTimes(): Promise<LeadResponseTime[]> {
  const { startDate, endDate } = getWeekRange();

  const { data: teamMembers } = await supabase.from("team_members").select("id, name");

  const nameById = new Map<string, string>();
  teamMembers?.forEach((m: any) => nameById.set(m.id, m.name));

  const { data: leads } = await supabase
    .from("leads")
    .select("assigned_to, created_at, first_contact_date, action_history")
    .gte("created_at", startDate)
    .lt("created_at", endDate)
    .not("assigned_to", "is", null)
    .is("deleted_at", null);

  if (!leads || leads.length === 0) return [];

  const statsMap = new Map<string, { totalHours: number; count: number }>();

  for (const lead of leads) {
    const agentId = lead.assigned_to as string | null;
    if (!agentId) continue;

    const createdAt = new Date(lead.created_at);
    if (isNaN(createdAt.getTime())) continue;

    let firstDate: Date | null = null;

    if (lead.first_contact_date) {
      const d = new Date(lead.first_contact_date);
      if (!isNaN(d.getTime())) firstDate = d;
    }

    if (!firstDate && lead.action_history && Array.isArray(lead.action_history)) {
      for (const action of lead.action_history) {
        const type = (action.actionType || action.type || "").toString();
        if (isAutoEmail(type)) continue;

        const d = getActionStatDate(action);
        if (!d) continue;
        if (!firstDate || d < firstDate) {
          firstDate = d;
        }
      }
    }

    if (!firstDate) continue;

    const diffMs = firstDate.getTime() - createdAt.getTime();
    if (diffMs < 0) continue;

    const hours = diffMs / (1000 * 60 * 60);

    const current = statsMap.get(agentId) || { totalHours: 0, count: 0 };
    current.totalHours += hours;
    current.count += 1;
    statsMap.set(agentId, current);
  }

  const result: LeadResponseTime[] = [];

  for (const [agentId, stat] of statsMap.entries()) {
    const name = nameById.get(agentId) || "Agent inconnu";
    result.push({
      agent_name: name,
      average_hours: stat.totalHours / stat.count,
      lead_count: stat.count,
    });
  }

  result.sort((a, b) => a.average_hours - b.average_hours);

  return result;
}

// ---- HTML ----

async function generateWeeklyReportHtml(): Promise<string> {
  const weeklyStats = await getWeeklyStats();
  const agentActivities = await getAgentWeeklyActivity();
  const dailyBreakdown = await getDailyBreakdown();
  const actionBreakdown = await getActionTypeBreakdown();
  const pipelineStats = await getAgentPipelineActionStats();
  const responseTimes = await getLeadResponseTimes();

  const { startDate } = getWeekRange();
  const weekStart = new Date(startDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const dateRange = `${weekStart.toLocaleDateString("fr-FR")} - ${weekEnd.toLocaleDateString("fr-FR")}`;

  let responseTimeHtml = "";

  if (responseTimes.length === 0) {
    responseTimeHtml = `
      <p>Cette semaine, aucun nouveau lead n'a été attribué à l'équipe ou les délais de premier contact ne sont pas encore renseignés.</p>
    `;
  } else {
    const globalAvgHours = responseTimes.reduce((sum, r) => sum + r.average_hours, 0) / responseTimes.length;

    const items = responseTimes
      .map(
        (r) => `
        <li><strong>${r.agent_name}</strong> : ${formatHoursToHuman(
          r.average_hours,
        )} (sur ${r.lead_count} lead${r.lead_count > 1 ? "s" : ""})</li>
      `,
      )
      .join("");

    responseTimeHtml = `
      <p>Temps moyen entre la création d'un lead et le premier contact effectif :</p>
      <ul>
        ${items}
      </ul>
      <p><strong>Moyenne globale équipe :</strong> ${formatHoursToHuman(globalAvgHours)}</p>
    `;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 900px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 15px; margin-bottom: 30px; }
    .stat-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; text-align: center; }
    .stat-value { font-size: 28px; font-weight: bold; color: #4f46e5; margin: 8px 0; }
    .stat-label { font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
    .evolution { font-size: 13px; margin-top: 4px; }
    .evolution.positive { color: #10b981; }
    .evolution.negative { color: #ef4444; }
    .section { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 25px; margin-bottom: 20px; }
    .section-title { font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1f2937; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f9fafb; padding: 10px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; font-size: 13px; }
    td { padding: 9px 10px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
    tr:last-child td { border-bottom: none; }
    .rank { display: inline-block; width: 30px; height: 30px; line-height: 30px; text-align: center; border-radius: 50%; font-weight: bold; }
    .rank-1 { background: #ffd700; color: #000; }
    .rank-2 { background: #c0c0c0; color: #000; }
    .rank-3 { background: #cd7f32; color: #fff; }
    .rank-other { background: #e5e7eb; color: #6b7280; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
    .badge-success { background: #d1fae5; color: #065f46; }
    .badge-info { background: #dbeafe; color: #1e40af; }
    .badge-warning { background: #fef3c7; color: #92400e; }
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
      <div class="stat-label">Actions Réalisées (hors Emails Auto)</div>
      <div class="stat-value">${weeklyStats.totalActionsCount}</div>
      <div class="evolution ${weeklyStats.totalActionsCount >= weeklyStats.previousWeekActionsCount ? "positive" : "negative"}">
        ${getEvolutionEmoji(weeklyStats.totalActionsCount, weeklyStats.previousWeekActionsCount)}
        ${getEvolutionPercentage(weeklyStats.totalActionsCount, weeklyStats.previousWeekActionsCount)}
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Compromis signés</div>
      <div class="stat-value">${weeklyStats.compromisCount}</div>
      <div class="evolution">Cette semaine</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Actes de vente</div>
      <div class="stat-value">${weeklyStats.acteVenteCount}</div>
      <div class="evolution">Cette semaine</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Contrats de location</div>
      <div class="stat-value">${weeklyStats.contratLocationCount}</div>
      <div class="evolution">Cette semaine</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Visites réalisées</div>
      <div class="stat-value">${weeklyStats.visitesDoneCount}</div>
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
          <th>Nouveaux Leads</th>
          <th>Actions</th>
          <th>Retards</th>
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
            <td><span class="badge ${agent.overdue_actions_count > 0 ? "badge-warning" : "badge-success"}">${agent.overdue_actions_count}</span></td>
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

  <div class="section">
    <div class="section-title">🎯 Actions par Agent & Pipeline</div>
    <table>
      <thead>
        <tr>
          <th>Agent</th>
          <th>Pipeline</th>
          <th>Total</th>
          <th>Call</th>
          <th>Follow up</th>
          <th>Visites faites</th>
          <th>Visites futures</th>
          <th>Estim.</th>
          <th>Prop.</th>
          <th>Prospect.</th>
          <th>Compromis</th>
          <th>Acte vente</th>
          <th>Contrat loc.</th>
          <th>Retards</th>
        </tr>
      </thead>
      <tbody>
        ${pipelineStats
          .map(
            (row) => `
          <tr>
            <td>${row.agent_name}</td>
            <td>${row.pipeline}</td>
            <td><span class="badge badge-info">${row.total_actions}</span></td>
            <td>${row.call}</td>
            <td>${row.follow_up}</td>
            <td>${row.visites_faites}</td>
            <td>${row.visites_futures}</td>
            <td>${row.estimation}</td>
            <td>${row.propositions}</td>
            <td>${row.prospection}</td>
            <td>${row.compromis}</td>
            <td>${row.acte_vente}</td>
            <td>${row.contrat_location}</td>
            <td><span class="badge ${row.overdue > 0 ? "badge-warning" : "badge-success"}">${row.overdue}</span></td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">⏱️ Temps de Traitement des Nouveaux Leads</div>
    ${responseTimeHtml}
  </div>

  <div class="footer">
    <p>Rapport généré automatiquement par Gadait CRM</p>
    <p>Pour toute question, contactez l'équipe technique.</p>
  </div>
</body>
</html>
  `;
}

// ---- HANDLER ----

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
      return new Response(JSON.stringify({ error: "Failed to send email", details: error }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("✅ Weekly report sent successfully:", data);

    return new Response(JSON.stringify({ success: true, message: "Weekly report sent", data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("❌ Error in weekly-activity-report:", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: "Internal server error", details: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
