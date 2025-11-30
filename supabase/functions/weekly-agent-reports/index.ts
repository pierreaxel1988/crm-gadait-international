import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

// -----------------------------------------
// ENV VARS
// -----------------------------------------
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

const RESEND_FROM = Deno.env.get("RESEND_FROM")!;
const RESEND_TO = Deno.env.get("RESEND_TO")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

// Managers en copie
const MANAGER_RECIPIENTS = RESEND_TO.split(",")
  .map((email) => email.trim())
  .filter(Boolean);

// -----------------------------------------
// MODE DEBUG — désactiver l'envoi aux agents
// -----------------------------------------
const SEND_TO_AGENTS = true; // ⚠️ mets false pour tests

// -----------------------------------------
// AGENTS CIBLÉS (filtrés par email)
// -----------------------------------------
const FOCUS_AGENT_EMAILS = [
  "jade@gadait-international.com",
  "franck.fontaine@gadait-international.com",
  "fleurs@gadait-international.com",
  "matthieu@gadait-international.com",
];

// -----------------------------------------
// HELPERS
// -----------------------------------------
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getParisDate(daysAgo = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const parisDate = new Date(date.toLocaleString("en-US", { timeZone: "Europe/Paris" }));
  parisDate.setHours(0, 0, 0, 0);
  return parisDate;
}

function getLastSunday(): Date {
  const today = getParisDate(0);
  const dow = today.getDay();
  const diff = dow === 0 ? 7 : dow;
  return getParisDate(diff);
}

function getWeekRange() {
  const lastSunday = getLastSunday();
  const nextSunday = new Date(lastSunday);
  nextSunday.setDate(nextSunday.getDate() + 7);

  return {
    startDate: lastSunday.toISOString(),
    endDate: nextSunday.toISOString(),
  };
}

function getPreviousWeekRange() {
  const lastSunday = getLastSunday();
  const prev = new Date(lastSunday);
  prev.setDate(prev.getDate() - 7);
  return {
    startDate: prev.toISOString(),
    endDate: lastSunday.toISOString(),
  };
}

function getActionStatDate(action: any): Date | null {
  const d = new Date(action.completedDate || action.scheduledDate || action.createdAt || action.date);
  return isNaN(d.getTime()) ? null : d;
}

function isAutoEmail(type: string): boolean {
  return type?.toLowerCase().startsWith("email auto");
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

function getEvolutionEmoji(current: number, previous: number) {
  if (current > previous) return "📈";
  if (current < previous) return "📉";
  return "➡️";
}

function getEvolutionPercentage(current: number, previous: number) {
  if (previous === 0) return current > 0 ? "+100%" : "0%";
  const diff = ((current - previous) / previous) * 100;
  return diff > 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`;
}

// -----------------------------------------
// DATA FETCHERS
// -----------------------------------------
async function getFocusedAgents() {
  const { data } = await supabase.from("team_members").select("id, name, email").in("email", FOCUS_AGENT_EMAILS);

  return data || [];
}

async function getAgentWeeklyStats(agentId: string) {
  const { startDate, endDate } = getWeekRange();
  const { startDate: ps, endDate: pe } = getPreviousWeekRange();

  const { count: newLeads } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("assigned_to", agentId)
    .gte("created_at", startDate)
    .lt("created_at", endDate)
    .is("deleted_at", null);

  const { count: prevLeads } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("assigned_to", agentId)
    .gte("created_at", ps)
    .lt("created_at", pe)
    .is("deleted_at", null);

  const { data: leadsWithActions } = await supabase
    .from("leads")
    .select("action_history")
    .eq("assigned_to", agentId)
    .is("deleted_at", null);

  let total = 0,
    prevTotal = 0,
    compromis = 0,
    acte = 0,
    loc = 0,
    visites = 0;

  if (leadsWithActions) {
    for (const lead of leadsWithActions) {
      for (const a of lead.action_history || []) {
        if (isAutoEmail(a.actionType)) continue;

        const d = getActionStatDate(a);
        if (!d) continue;

        if (d >= new Date(startDate) && d < new Date(endDate)) {
          total++;
          const t = a.actionType?.toLowerCase();
          if (t === "compromis") compromis++;
          if (t === "acte de vente") acte++;
          if (t === "contrat de location") loc++;
          if (t === "visites" && a.completedDate) visites++;
        }

        if (d >= new Date(ps) && d < new Date(pe)) {
          prevTotal++;
        }
      }
    }
  }

  return {
    newLeadsCount: newLeads ?? 0,
    previousWeekNewLeads: prevLeads ?? 0,
    totalActionsCount: total,
    previousWeekActionsCount: prevTotal,
    compromisCount: compromis,
    acteVenteCount: acte,
    contratLocationCount: loc,
    visitesDoneCount: visites,
  };
}

async function getAgentDailyBreakdown(agentId: string) {
  const { startDate } = getWeekRange();
  const daily: any[] = [];
  const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

  const { data: leads } = await supabase
    .from("leads")
    .select("created_at, action_history")
    .eq("assigned_to", agentId)
    .is("deleted_at", null);

  for (let i = 0; i < 7; i++) {
    const ds = new Date(startDate);
    ds.setDate(ds.getDate() + i);
    const de = new Date(ds);
    de.setDate(de.getDate() + 1);

    let newLeads = 0,
      actions = 0;

    for (const lead of leads ?? []) {
      const created = new Date(lead.created_at);
      if (created >= ds && created < de) newLeads++;

      for (const a of lead.action_history || []) {
        if (isAutoEmail(a.actionType)) continue;
        const d = getActionStatDate(a);
        if (d && d >= ds && d < de) actions++;
      }
    }

    daily.push({
      day_name: dayNames[ds.getDay()],
      date: ds.toLocaleDateString("fr-FR"),
      new_leads: newLeads,
      actions,
    });
  }

  return daily;
}

async function getAgentActionTypeBreakdown(agentId: string) {
  const { startDate, endDate } = getWeekRange();

  const { data } = await supabase
    .from("leads")
    .select("action_history")
    .eq("assigned_to", agentId)
    .is("deleted_at", null);

  const counts: any = {};

  for (const lead of data ?? []) {
    for (const a of lead.action_history || []) {
      if (isAutoEmail(a.actionType)) continue;
      const d = getActionStatDate(a);
      if (!d) continue;
      if (d < new Date(startDate) || d >= new Date(endDate)) continue;

      const t = a.actionType || "Autre";
      counts[t] = (counts[t] || 0) + 1;
    }
  }

  return {
    actions_by_type: Object.entries(counts)
      .map(([action_type, count]) => ({ action_type, count }))
      .sort((a, b) => b.count - a.count),
  };
}

async function getAgentPipelineStats(agentId: string) {
  const { startDate, endDate } = getWeekRange();
  const start = new Date(startDate),
    end = new Date(endDate),
    now = new Date();

  const { data: leads } = await supabase
    .from("leads")
    .select("pipeline_type, action_history")
    .eq("assigned_to", agentId)
    .is("deleted_at", null);

  const rows = new Map();

  for (const lead of leads ?? []) {
    const p = lead.pipeline_type;
    if (!p) continue;

    if (!rows.has(p)) {
      rows.set(p, {
        pipeline: p,
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

    const row = rows.get(p);

    for (const a of lead.action_history || []) {
      if (isAutoEmail(a.actionType)) continue;

      const d = getActionStatDate(a);
      if (!d) continue;

      if (d >= start && d < end) {
        row.total_actions++;
        const t = a.actionType?.toLowerCase();

        if (t === "call") row.call++;
        else if (t === "follow up") row.follow_up++;
        else if (t === "prospection") row.prospection++;
        else if (t === "estimation") row.estimation++;
        else if (t === "propositions") row.propositions++;
        else if (t === "compromis") row.compromis++;
        else if (t === "acte de vente") row.acte_vente++;
        else if (t === "contrat de location") row.contrat_location++;
        else if (t === "visites") {
          if (a.completedDate) row.visites_faites++;
          else if (a.scheduledDate) row.visites_futures++;
        }
      }

      if (a.scheduledDate && !a.completedDate) {
        const sched = new Date(a.scheduledDate);
        if (!isNaN(sched.getTime()) && sched < now) {
          row.overdue++;
        }
      }
    }
  }

  return Array.from(rows.values()).sort((a, b) => a.pipeline.localeCompare(b.pipeline));
}

async function getLeadResponseTimesAll() {
  const { startDate, endDate } = getWeekRange();

  const { data: leads } = await supabase
    .from("leads")
    .select("assigned_to, created_at, first_contact_date, action_history")
    .gte("created_at", startDate)
    .lt("created_at", endDate)
    .not("assigned_to", "is", null)
    .is("deleted_at", null);

  const nameById = new Map(
    ((await supabase.from("team_members").select("id,name")).data || []).map((m) => [m.id, m.name]),
  );

  const stats = new Map();

  for (const lead of leads ?? []) {
    const agentId = lead.assigned_to;
    if (!agentId) continue;

    const created = new Date(lead.created_at);
    if (isNaN(created.getTime())) continue;

    let first: Date | null = null;

    if (lead.first_contact_date) {
      const d = new Date(lead.first_contact_date);
      if (!isNaN(d.getTime())) first = d;
    }

    for (const a of lead.action_history || []) {
      if (isAutoEmail(a.actionType)) continue;
      const d = getActionStatDate(a);
      if (!d) continue;
      if (!first || d < first) first = d;
    }

    if (!first) continue;

    const h = (first.getTime() - created.getTime()) / 3_600_000;
    if (h < 0) continue;

    const entry = stats.get(agentId) || { total: 0, count: 0 };
    entry.total += h;
    entry.count++;
    stats.set(agentId, entry);
  }

  return Array.from(stats.entries())
    .map(([id, v]) => ({
      agent_name: nameById.get(id),
      average_hours: v.total / v.count,
      lead_count: v.count,
    }))
    .sort((a, b) => a.average_hours - b.average_hours);
}

// -----------------------------------------
// HTML BUILDER PAR AGENT
// -----------------------------------------
function buildAgentReportHtml(agent, stats, daily, actions, pipeline, rtAll) {
  const { startDate } = getWeekRange();
  const ws = new Date(startDate);
  const we = new Date(ws);
  we.setDate(we.getDate() + 6);

  const dateRange = `${ws.toLocaleDateString("fr-FR")} - ${we.toLocaleDateString("fr-FR")}`;

  const rt = rtAll.find((r) => r.agent_name === agent.name);

  const teamAvg = rtAll.length > 0 ? rtAll.reduce((s, r) => s + r.average_hours, 0) / rtAll.length : null;

  const rtHtml = !rt
    ? `<p>Pas de contact enregistré pour tes leads cette semaine.</p>`
    : `
    <p><strong>Temps moyen de prise en charge :</strong> ${formatHoursToHuman(rt.average_hours)} (${rt.lead_count} lead${rt.lead_count > 1 ? "s" : ""})
    </p>
    ${teamAvg ? `<p>Moyenne équipe : ${formatHoursToHuman(teamAvg)}</p>` : ""}
  `;

  const rowsDaily = daily
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

  const actionRows =
    actions.actions_by_type.length === 0
      ? `<tr><td colspan="2" style="color:#999">Aucune action</td></tr>`
      : actions.actions_by_type
          .map(
            (a) => `
          <tr>
            <td>${a.action_type}</td>
            <td><span class="badge badge-info">${a.count}</span></td>
          </tr>
        `,
          )
          .join("");

  const pipeRows =
    pipeline.length === 0
      ? `<tr><td colspan="6" style="color:#999">Aucune donnée</td></tr>`
      : pipeline
          .map((row) => {
            const contact = row.call + row.follow_up + row.prospection;
            const adv = row.visites_faites + row.visites_futures + row.estimation + row.propositions;
            const closing = row.compromis + row.acte_vente + row.contrat_location;

            return `
        <tr>
          <td>${row.pipeline}</td>
          <td>${row.total_actions}</td>
          <td>${contact}</td>
          <td>${adv}</td>
          <td>${closing}</td>
          <td>${row.overdue}</td>
        </tr>
      `;
          })
          .join("");

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  max-width: 860px;
  margin: 0 auto;
}
.badge {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
}
.badge-info { background:#dbeafe; color:#1e40af;}
</style>
</head>
<body>

<h2>📊 Rapport Hebdomadaire – ${agent.name}</h2>
<p>Période : <strong>${dateRange}</strong></p>

<h3>📈 Résultats clés</h3>

<ul>
  <li>Nouveaux leads : <strong>${stats.newLeadsCount}</strong> (${getEvolutionEmoji(stats.newLeadsCount, stats.previousWeekNewLeads)} ${getEvolutionPercentage(stats.newLeadsCount, stats.previousWeekNewLeads)})</li>
  <li>Actions réalisées : <strong>${stats.totalActionsCount}</strong> (${getEvolutionEmoji(stats.totalActionsCount, stats.previousWeekActionsCount)} ${getEvolutionPercentage(stats.totalActionsCount, stats.previousWeekActionsCount)})</li>
  <li>Compromis : ${stats.compromisCount}</li>
  <li>Actes de vente : ${stats.acteVenteCount}</li>
  <li>Contrats location : ${stats.contratLocationCount}</li>
  <li>Visites réalisées : ${stats.visitesDoneCount}</li>
</ul>

<h3>📅 Activité quotidienne</h3>
<table border="1" width="100%" cellpadding="6" style="border-collapse: collapse;">
${rowsDaily}
</table>

<h3>⚡ Actions par type</h3>
<table border="1" width="100%" cellpadding="6" style="border-collapse: collapse;">
<tr><th>Type</th><th>Nb</th></tr>
${actionRows}
</table>

<h3>🎯 Pipeline</h3>
<table border="1" width="100%" cellpadding="6" style="border-collapse: collapse;">
<tr><th>Pipeline</th><th>Total</th><th>Contact</th><th>Avancement</th><th>Closing</th><th>Retards</th></tr>
${pipeRows}
</table>

<h3>⏱️ Temps de réponse aux leads</h3>
${rtHtml}

<p style="margin-top:40px;">Bonne semaine, et bravo pour ton travail !</p>

</body>
</html>
`;
}

// -----------------------------------------
// HANDLER PRINCIPAL
// -----------------------------------------
const handler = async () => {
  console.log("🚀 Generating weekly agent reports...");

  const agents = await getFocusedAgents();
  const responseTimesAll = await getLeadResponseTimesAll();

  const results = [];

  for (const agent of agents) {
    const stats = await getAgentWeeklyStats(agent.id);
    const daily = await getAgentDailyBreakdown(agent.id);
    const actions = await getAgentActionTypeBreakdown(agent.id);
    const pipeline = await getAgentPipelineStats(agent.id);

    const html = buildAgentReportHtml(agent, stats, daily, actions, pipeline, responseTimesAll);

    const toSend = SEND_TO_AGENTS && agent.email ? [agent.email] : MANAGER_RECIPIENTS;

    const { data, error } = await resend.emails.send({
      from: RESEND_FROM,
      to: toSend,
      cc: MANAGER_RECIPIENTS,
      subject: `📊 Rapport Hebdomadaire - ${agent.name}`,
      html,
    });

    if (error) {
      console.error("❌ ERROR sending:", agent.name, error);
      results.push({ agent: agent.name, success: false, error });
    } else {
      console.log("✅ Sent:", agent.name);
      results.push({ agent: agent.name, success: true });
    }

    // *** RATE LIMIT FIX ***
    await sleep(1200);
  }

  return new Response(JSON.stringify({ success: true, results }), {
    headers: { "Content-Type": "application/json" },
  });
};

serve(handler);
