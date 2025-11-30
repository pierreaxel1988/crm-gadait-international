import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

// --- ENV VARS (mêmes que pour le rapport global) ---
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

const RESEND_FROM = Deno.env.get("RESEND_FROM")!; // "Gadait Team <team@gadait-international.com>"
const RESEND_TO = Deno.env.get("RESEND_TO")!; // "pierre@gadait-international.com"

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

// Les destinataires managers : RESEND_TO + Christelle
const EXTRA_MANAGER_EMAILS = ["christelle@gadait-international.com"];

const MANAGER_RECIPIENTS = [
  ...RESEND_TO.split(",")
    .map((email) => email.trim())
    .filter(Boolean),
  ...EXTRA_MANAGER_EMAILS,
];

// Mode : si false → uniquement MANAGER_RECIPIENTS reçoivent les rapports
// si true → l'agent reçoit le mail, les managers sont en copie.
const SEND_TO_AGENTS = true;

// On commence avec ces 4 agents (on filtre maintenant par EMAIL)
const FOCUS_AGENT_EMAILS = [
  "jade@gadait-international.com",
  "franck.fontaine@gadait-international.com", // ✅ adresse correcte
  "fleurs@gadait-international.com",
  "matthieu@gadait-international.com",
];

interface TeamMember {
  id: string;
  name: string;
  email: string | null;
}

interface WeeklyStatsAgent {
  newLeadsCount: number;
  previousWeekNewLeads: number;
  totalActionsCount: number;
  previousWeekActionsCount: number;
  compromisCount: number;
  acteVenteCount: number;
  contratLocationCount: number;
  visitesDoneCount: number;
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
  actions_by_type: ActionTypeBreakdown[];
}

interface AgentPipelineStatsRow {
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

function getActionStatDate(action: any): Date | null {
  const dateStr = action.completedDate || action.scheduledDate || action.createdAt || action.date;

  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d;
}

function isAutoEmail(actionTypeRaw: any): boolean {
  if (!actionTypeRaw) return false;
  const t = String(actionTypeRaw).toLowerCase();
  return t.startsWith("email auto");
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

// ---- DATA FETCHERS ----

// On filtre maintenant les agents par leurs EMAILS (plus fiable que le nom)
async function getFocusedAgents(): Promise<TeamMember[]> {
  const { data, error } = await supabase.from("team_members").select("id, name, email").in("email", FOCUS_AGENT_EMAILS);

  if (error || !data) {
    console.error("Error fetching focused agents:", error);
    return [];
  }

  return data as TeamMember[];
}

async function getAgentWeeklyStats(agentId: string): Promise<WeeklyStatsAgent> {
  const { startDate, endDate } = getWeekRange();
  const { startDate: prevStartDate, endDate: prevEndDate } = getPreviousWeekRange();

  const start = new Date(startDate);
  const end = new Date(endDate);
  const prevStart = new Date(prevStartDate);
  const prevEnd = new Date(prevEndDate);

  // Nouveaux leads (semaine & semaine précédente) POUR L'AGENT
  const { count: newLeadsCountRaw } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("assigned_to", agentId)
    .gte("created_at", startDate)
    .lt("created_at", endDate)
    .is("deleted_at", null);

  const { count: prevNewLeadsRaw } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("assigned_to", agentId)
    .gte("created_at", prevStartDate)
    .lt("created_at", prevEndDate)
    .is("deleted_at", null);

  const { data: leadsWithActions } = await supabase
    .from("leads")
    .select("action_history")
    .eq("assigned_to", agentId)
    .is("deleted_at", null);

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
          if (isAutoEmail(type)) continue;

          const statDate = getActionStatDate(action);
          if (!statDate) continue;

          if (statDate >= start && statDate < end) {
            totalActionsCount++;

            const t = type.toLowerCase();
            if (t === "compromis") compromisCount++;
            if (t === "acte de vente") acteVenteCount++;
            if (t === "contrat de location") contratLocationCount++;

            if (t === "visites" && action.completedDate) {
              const done = new Date(action.completedDate);
              if (!isNaN(done.getTime()) && done >= start && done < end) {
                visitesDoneCount++;
              }
            }
          }

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

async function getAgentDailyBreakdown(agentId: string): Promise<DailyBreakdown[]> {
  const { startDate } = getWeekRange();
  const dailyData: DailyBreakdown[] = [];

  const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

  const { data: leadsWithActions } = await supabase
    .from("leads")
    .select("created_at, action_history")
    .eq("assigned_to", agentId)
    .is("deleted_at", null);

  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(startDate);
    dayStart.setDate(dayStart.getDate() + i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    let newLeadsCount = 0;
    let actionsCount = 0;

    if (leadsWithActions) {
      for (const lead of leadsWithActions) {
        const createdAt = new Date(lead.created_at);
        if (!isNaN(createdAt.getTime()) && createdAt >= dayStart && createdAt < dayEnd) {
          newLeadsCount++;
        }

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
      new_leads: newLeadsCount,
      actions: actionsCount,
    });
  }

  return dailyData;
}

async function getAgentActionTypeBreakdown(agentId: string): Promise<AgentActionBreakdown> {
  const { startDate, endDate } = getWeekRange();
  const start = new Date(startDate);
  const end = new Date(endDate);

  const { data: leadsWithActions } = await supabase
    .from("leads")
    .select("action_history")
    .eq("assigned_to", agentId)
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

  return { actions_by_type };
}

async function getAgentPipelineStats(agentId: string): Promise<AgentPipelineStatsRow[]> {
  const { startDate, endDate } = getWeekRange();
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  const { data: leads } = await supabase
    .from("leads")
    .select("pipeline_type, action_history")
    .eq("assigned_to", agentId)
    .is("deleted_at", null);

  const rowsMap = new Map<string, AgentPipelineStatsRow>();

  if (!leads) return [];

  for (const lead of leads) {
    const pipeline = lead.pipeline_type;
    if (!pipeline) continue;

    const key = pipeline;

    if (!rowsMap.has(key)) {
      rowsMap.set(key, {
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
  rows.sort((a, b) => a.pipeline.localeCompare(b.pipeline));
  return rows;
}

async function getLeadResponseTimesAll(): Promise<LeadResponseTime[]> {
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

// ---- HTML PAR AGENT ----

function buildAgentReportHtml(
  agent: TeamMember,
  stats: WeeklyStatsAgent,
  daily: DailyBreakdown[],
  actionsBreakdown: AgentActionBreakdown,
  pipelineStats: AgentPipelineStatsRow[],
  responseTimesAll: LeadResponseTime[],
): string {
  const { startDate } = getWeekRange();
  const weekStart = new Date(startDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const dateRange = `${weekStart.toLocaleDateString("fr-FR")} - ${weekEnd.toLocaleDateString("fr-FR")}`;

  const agentRt = responseTimesAll.find((r) => r.agent_name === agent.name);
  const teamAvgHours =
    responseTimesAll.length > 0
      ? responseTimesAll.reduce((s, r) => s + r.average_hours, 0) / responseTimesAll.length
      : null;

  let responseTimeHtml = "";

  if (!agentRt) {
    responseTimeHtml = `
      <p>Cette semaine, aucun nouveau lead attribué ou pas encore de premier contact enregistré pour toi.</p>
    `;
  } else {
    responseTimeHtml = `
      <p><strong>Temps moyen de prise en charge de tes leads :</strong> ${formatHoursToHuman(
        agentRt.average_hours,
      )} (sur ${agentRt.lead_count} lead${agentRt.lead_count > 1 ? "s" : ""}).</p>
      ${
        teamAvgHours !== null
          ? `<p><strong>Moyenne globale équipe :</strong> ${formatHoursToHuman(teamAvgHours)}</p>`
          : ""
      }
    `;
  }

  const actionByTypeRows =
    actionsBreakdown.actions_by_type.length === 0
      ? "<tr><td colspan='2' style='color:#9ca3af;'>Aucune action cette semaine.</td></tr>"
      : actionsBreakdown.actions_by_type
          .map(
            (a) => `
        <tr>
          <td>${a.action_type}</td>
          <td><span class="badge badge-info">${a.count}</span></td>
        </tr>
      `,
          )
          .join("");

  const pipelineRows =
    pipelineStats.length === 0
      ? "<tr><td colspan='7' style='color:#9ca3af;'>Aucune action cette semaine.</td></tr>"
      : pipelineStats
          .map((row) => {
            const contact = row.call + row.follow_up + row.prospection;
            const advancement = row.visites_faites + row.visites_futures + row.estimation + row.propositions;
            const closing = row.compromis + row.acte_vente + row.contrat_location;

            const contactBadgeClass = contact > 0 ? "badge-info" : "badge-muted";
            const advBadgeClass = advancement > 0 ? "badge-success" : "badge-muted";
            const closingBadgeClass = closing > 0 ? "badge-warning" : "badge-muted";
            const overdueBadgeClass = row.overdue > 0 ? "badge-warning" : "badge-success";

            return `
        <tr>
          <td>${row.pipeline}</td>
          <td><span class="badge badge-info">${row.total_actions}</span></td>
          <td><span class="badge ${contactBadgeClass}">${contact}</span></td>
          <td><span class="badge ${advBadgeClass}">${advancement}</span></td>
          <td><span class="badge ${closingBadgeClass}">${closing}</span></td>
          <td><span class="badge ${overdueBadgeClass}">${row.overdue}</span></td>
        </tr>
      `;
          })
          .join("");

  const dailyRows = daily
    .map(
      (d) => `
      <tr>
        <td><strong>${d.day_name}</strong></td>
        <td>${d.date}</td>
        <td>${d.new_leads}</td>
        <td>${d.actions}</td>
      </tr>
    `,
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 900px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 26px; border-radius: 10px; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 6px 0 0 0; opacity: 0.9; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 15px; margin-bottom: 30px; }
    .stat-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; text-align: center; }
    .stat-value { font-size: 26px; font-weight: bold; color: #4f46e5; margin: 8px 0; }
    .stat-label { font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
    .evolution { font-size: 13px; margin-top: 4px; }
    .evolution.positive { color: #10b981; }
    .evolution.negative { color: #ef4444; }
    .section { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 22px; margin-bottom: 20px; }
    .section-title { font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #1f2937; border-bottom: 2px solid #667eea; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f9fafb; padding: 8px 10px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; font-size: 13px; }
    td { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
    tr:last-child td { border-bottom: none; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
    .badge-success { background: #d1fae5; color: #065f46; }
    .badge-info { background: #dbeafe; color: #1e40af; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-muted { background: #e5e7eb; color: #4b5563; }
    .footer { text-align: center; padding: 18px; color: #6b7280; font-size: 13px; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Rapport Hebdomadaire - ${agent.name}</h1>
    <p>Gadait International CRM</p>
    <p>${dateRange}</p>
  </div>

  <p>Bonjour ${agent.name.split(" ")[0]},</p>
  <p>Voici ton récapitulatif d'activité pour la semaine écoulée.</p>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Nouveaux Leads</div>
      <div class="stat-value">${stats.newLeadsCount}</div>
      <div class="evolution ${stats.newLeadsCount >= stats.previousWeekNewLeads ? "positive" : "negative"}">
        ${getEvolutionEmoji(stats.newLeadsCount, stats.previousWeekNewLeads)}
        ${getEvolutionPercentage(stats.newLeadsCount, stats.previousWeekNewLeads)}
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Actions réalisées (hors Emails Auto)</div>
      <div class="stat-value">${stats.totalActionsCount}</div>
      <div class="evolution ${stats.totalActionsCount >= stats.previousWeekActionsCount ? "positive" : "negative"}">
        ${getEvolutionEmoji(stats.totalActionsCount, stats.previousWeekActionsCount)}
        ${getEvolutionPercentage(stats.totalActionsCount, stats.previousWeekActionsCount)}
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Compromis signés</div>
      <div class="stat-value">${stats.compromisCount}</div>
      <div class="evolution">Cette semaine</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Actes de vente</div>
      <div class="stat-value">${stats.acteVenteCount}</div>
      <div class="evolution">Cette semaine</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Contrats de location</div>
      <div class="stat-value">${stats.contratLocationCount}</div>
      <div class="evolution">Cette semaine</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Visites réalisées</div>
      <div class="stat-value">${stats.visitesDoneCount}</div>
      <div class="evolution">Cette semaine</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">📅 Activité quotidienne</div>
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
        ${dailyRows}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">⚡ Actions par type</div>
    <table>
      <thead>
        <tr>
          <th>Type d'action</th>
          <th>Nombre</th>
        </tr>
      </thead>
      <tbody>
        ${actionByTypeRows}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">🎯 Actions par pipeline</div>
    <p style="font-size:13px; color:#6b7280; margin-bottom:10px;">
      Contact = Call + Follow up + Prospection ·
      Avancement = Visites + Estimations + Propositions ·
      Closing = Compromis + Actes de vente + Contrats de location.
    </p>
    <table>
      <thead>
        <tr>
          <th>Pipeline</th>
          <th>Total</th>
          <th>Contact</th>
          <th>Avancement</th>
          <th>Closing</th>
          <th>Retards</th>
        </tr>
      </thead>
      <tbody>
        ${pipelineRows}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">⏱️ Temps de traitement des nouveaux leads</div>
    ${responseTimeHtml}
  </div>

  <p>Bonne semaine et n'hésite pas à voir avec la direction si tu veux analyser certains points en détail.</p>

  <div class="footer">
    <p>Rapport généré automatiquement par Gadait CRM</p>
  </div>
</body>
</html>
  `;
}

// ---- ENVOI EMAIL AVEC RETRY / RATE LIMIT ----

async function sendEmailWithRetry(payload: any) {
  let attempt = 0;

  while (attempt < 2) {
    const { data, error } = await resend.emails.send(payload);

    if (!error) {
      return { data, error: null };
    }

    const statusCode = (error as any)?.statusCode;
    console.error("❌ Error sending email:", statusCode, error);

    // Si rate limit Resend → on attend et on réessaie une fois
    if (statusCode === 429 && attempt === 0) {
      console.warn("⏳ Resend rate_limit_exceeded, retry dans 2s...");
      await sleep(2000);
      attempt++;
      continue;
    }

    return { data: null, error };
  }

  return { data: null, error: new Error("Unknown send error") };
}

// ---- HANDLER ----

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 Generating weekly agent reports...");

    const agents = await getFocusedAgents();
    if (agents.length === 0) {
      console.log("No focused agents found.");
      return new Response(JSON.stringify({ success: false, message: "No agents found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const responseTimesAll = await getLeadResponseTimesAll();

    const results: any[] = [];

    for (const agent of agents) {
      const stats = await getAgentWeeklyStats(agent.id);
      const daily = await getAgentDailyBreakdown(agent.id);
      const actionsBreakdown = await getAgentActionTypeBreakdown(agent.id);
      const pipelineStats = await getAgentPipelineStats(agent.id);

      const html = buildAgentReportHtml(agent, stats, daily, actionsBreakdown, pipelineStats, responseTimesAll);

      const toRecipients = SEND_TO_AGENTS && agent.email ? [agent.email] : MANAGER_RECIPIENTS;

      const payload: any = {
        from: RESEND_FROM,
        to: toRecipients,
        subject: `📊 Rapport Hebdomadaire - ${agent.name}`,
        html,
      };

      if (SEND_TO_AGENTS) {
        payload.cc = MANAGER_RECIPIENTS;
      }

      const { data, error } = await sendEmailWithRetry(payload);

      if (error) {
        console.error(`❌ Error sending report for ${agent.name}:`, error);
        results.push({ agent: agent.name, success: false, error });
      } else {
        console.log(`✅ Report sent for ${agent.name}:`, data);
        results.push({ agent: agent.name, success: true, data });
      }

      // Petite pause entre chaque envoi pour être encore plus safe
      await sleep(1200);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Agent reports processed",
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err: unknown) {
    console.error("❌ Error in weekly-agent-reports:", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: "Internal server error", details: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
