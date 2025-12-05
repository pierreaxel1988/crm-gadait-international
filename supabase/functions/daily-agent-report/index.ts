import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

// --- ENV VARS ---
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
const RESEND_FROM = Deno.env.get("RESEND_FROM")!;
const RESEND_TO = Deno.env.get("RESEND_TO")!;
const SUCCESS_LEAD_BASE_URL = Deno.env.get("SUCCESS_LEAD_BASE_URL") ?? "https://success.gadait-international.com/leads";

const supabase = createClient(supabaseUrl, supabaseServiceRole);
const resend = new Resend(resendApiKey);

// ---- CONFIGURATION ----
const EXTRA_MANAGER_EMAILS = ["christelle@gadait-international.com"];

const MANAGER_RECIPIENTS = [
  ...RESEND_TO.split(",")
    .map((e) => e.trim())
    .filter(Boolean),
  ...EXTRA_MANAGER_EMAILS,
];

const SEND_TO_AGENTS = true;

const FOCUS_AGENT_EMAILS = [
  "jade@gadait-international.com",
  "franck.fontaine@gadait-international.com",
  "fleurs@gadait-international.com",
  "matthieu@gadait-international.com",
];

// ---- TYPES ----
interface TeamMember {
  id: string;
  name: string;
  email: string | null;
}

interface PlanningAction {
  lead_id: string;
  lead_name: string;
  pipeline: string | null;
  type: string;
  scheduled_at: Date | null;
  notes?: string | null;
  is_overdue: boolean;
}

interface UntaggedLead {
  lead_id: string;
  lead_name: string;
}

// ---- HELPERS ----
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const getParisDate = (daysAgo = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const p = new Date(d.toLocaleString("en-US", { timeZone: "Europe/Paris" }));
  p.setHours(0, 0, 0, 0);
  return p;
};

const getParisNow = () => new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Paris" }));

const escapeHtml = (t: string | null | undefined) =>
  t ? t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";

const formatDateFR = (d: Date | null) =>
  !d
    ? "-"
    : d.toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
      });

const isAutoEmail = (t: string) => t.toLowerCase().startsWith("email auto");

const makeLeadUrl = (id: string) => `${SUCCESS_LEAD_BASE_URL}/${id}`;

// ---- QUERY AGENTS ----
async function getFocusedAgents(): Promise<TeamMember[]> {
  const { data, error } = await supabase.from("team_members").select("id, name, email").in("email", FOCUS_AGENT_EMAILS);

  if (error || !data) return [];
  return data as TeamMember[];
}

// ---- DAILY RANGE ----
function getParisTodayRange() {
  const start = getParisDate(0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { startDate: start, endDate: end };
}

// ---- DAILY REPORT ----
async function getAgentDailyPlanning(agentId: string) {
  const { startDate, endDate } = getParisTodayRange();
  const now = getParisNow();

  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, name, pipeline_type, action_history, tags")
    .eq("assigned_to", agentId)
    .is("deleted_at", null);

  if (error || !leads) {
    return {
      today: [] as PlanningAction[],
      overdue: [] as PlanningAction[],
      counts: { today: 0, overdue: 0 },
      untaggedLeads: [] as UntaggedLead[],
    };
  }

  const today: PlanningAction[] = [];
  const overdue: PlanningAction[] = [];
  const untaggedLeads: UntaggedLead[] = [];

  for (const lead of leads as any[]) {
    // --- détection des leads sans tag ---
    const tags = (lead as any).tags;
    const hasTags = Array.isArray(tags) ? tags.length > 0 : !!tags;

    if (!hasTags) {
      untaggedLeads.push({
        lead_id: lead.id,
        lead_name: lead.name,
      });
    }
    // --- fin détection leads sans tag ---

    for (const action of lead.action_history || []) {
      const type = (action.actionType || action.type).toString();
      if (isAutoEmail(type)) continue;

      const scheduled = action.scheduledDate ? new Date(action.scheduledDate) : null;
      const completed = action.completedDate ? new Date(action.completedDate) : null;

      if (!scheduled || isNaN(scheduled.getTime())) continue;

      const is_overdue = scheduled < now && !completed;
      const is_today = scheduled >= startDate && scheduled < endDate;

      if (!is_overdue && !is_today) continue;

      const item: PlanningAction = {
        lead_id: lead.id,
        lead_name: lead.name,
        pipeline: lead.pipeline_type,
        type,
        scheduled_at: scheduled,
        notes: action.notes || null,
        is_overdue,
      };

      if (is_overdue) overdue.push(item);
      else today.push(item);
    }
  }

  // Optionnel : tri des leads sans tag par ordre alpha
  untaggedLeads.sort((a, b) => a.lead_name.localeCompare(b.lead_name, "fr-FR"));

  return {
    today,
    overdue,
    counts: {
      today: today.length,
      overdue: overdue.length,
    },
    untaggedLeads,
  };
}

// ---- UPCOMING (7 DAYS) ----
function getComingWeekRange() {
  const start = getParisDate(0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { startDate: start, endDate: end };
}

async function getAgentUpcomingPlanning(agentId: string) {
  const { startDate, endDate } = getComingWeekRange();

  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, name, pipeline_type, action_history")
    .eq("assigned_to", agentId)
    .is("deleted_at", null);

  if (error || !leads) return { upcoming: [] as PlanningAction[], count: 0 };

  const upcoming: PlanningAction[] = [];

  for (const lead of leads as any[]) {
    for (const action of lead.action_history || []) {
      const type = (action.actionType || action.type).toString();
      if (isAutoEmail(type)) continue;

      const scheduled = action.scheduledDate ? new Date(action.scheduledDate) : null;
      if (!scheduled || isNaN(scheduled.getTime())) continue;

      const isUpcoming = scheduled >= startDate && scheduled < endDate;
      if (!isUpcoming) continue;

      upcoming.push({
        lead_id: lead.id,
        lead_name: lead.name,
        pipeline: lead.pipeline_type,
        type,
        scheduled_at: scheduled,
        notes: action.notes,
        is_overdue: false,
      });
    }
  }

  upcoming.sort((a, b) => a.scheduled_at!.getTime() - b.scheduled_at!.getTime());
  return { upcoming, count: upcoming.length };
}

// ---- HTML BUILDER ----
function buildDailyReportHtml(agent: TeamMember, summary: any, upcoming: any) {
  const firstName = agent.name.split(" ")[0];

  const list = (arr: PlanningAction[]) =>
    arr.length === 0
      ? "<li>Aucune action</li>"
      : arr
          .map(
            (a) =>
              `<li><strong>${formatDateFR(a.scheduled_at)}</strong> – ${escapeHtml(
                a.type,
              )} – <a href="${makeLeadUrl(a.lead_id)}">${escapeHtml(a.lead_name)}</a></li>`,
          )
          .join("");

  const untaggedList =
    summary.untaggedLeads && summary.untaggedLeads.length
      ? `
    <h3 style="color:#b00020;">⚠️ Attention : clients sans tag</h3>
    <p style="font-size:14px;">
      Les clients ci-dessous n'ont pas encore de tag attribué.<br/>
      Vous pouvez leur attribuer un statut / tag dans l’onglet <strong>Statut</strong> de la fiche du lead.
    </p>
    <ul>
      ${summary.untaggedLeads
        .map((l: UntaggedLead) => `<li><a href="${makeLeadUrl(l.lead_id)}">${escapeHtml(l.lead_name)}</a></li>`)
        .join("")}
    </ul>
    `
      : "";

  return `
  <html>
  <body style="font-family: Arial; padding: 20px; color: #111;">
    <h2>📅 Rapport journalier – ${escapeHtml(agent.name)}</h2>
    <p>Bonjour ${escapeHtml(firstName)}, voici ton résumé du jour.</p>

    <h3>🔥 Actions en retard (${summary.counts.overdue})</h3>
    <ul>${list(summary.overdue)}</ul>

    <h3>🗓️ Actions du jour (${summary.counts.today})</h3>
    <ul>${list(summary.today)}</ul>

    <h3>📅 Actions à venir (7 prochains jours) – ${upcoming.count}</h3>
    <ul>${list(upcoming.upcoming)}</ul>

    ${untaggedList}

    <p style="font-size:12px;color:#777;">Rapport généré automatiquement via Success.</p>
  </body>
  </html>
  `;
}

// ---- SEND DAILY ----
async function sendDailyReports() {
  console.log("📨 Sending DAILY reports…");

  const agents = await getFocusedAgents();
  if (!agents.length) return;

  for (const agent of agents) {
    const summary = await getAgentDailyPlanning(agent.id);
    const upcoming = await getAgentUpcomingPlanning(agent.id);

    if (
      summary.counts.today === 0 &&
      summary.counts.overdue === 0 &&
      upcoming.count === 0 &&
      (!summary.untaggedLeads || summary.untaggedLeads.length === 0)
    ) {
      console.log(`No content for ${agent.name}`);
      continue;
    }

    const html = buildDailyReportHtml(agent, summary, upcoming);

    const to: string[] = [];
    const cc: string[] = [];

    if (SEND_TO_AGENTS && agent.email) {
      to.push(agent.email);
      cc.push(...MANAGER_RECIPIENTS);
    } else {
      to.push(...MANAGER_RECIPIENTS);
    }

    await resend.emails.send({
      from: RESEND_FROM,
      to,
      cc: cc.length ? cc : undefined,
      subject: `📅 Rapport journalier – ${agent.name}`,
      html,
    });

    await sleep(1200);
  }
}

// ---- HANDLER ----
const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const type = url.searchParams.get("type");

  try {
    if (type === "daily") {
      await sendDailyReports();
      return new Response(JSON.stringify({ success: true, message: "Daily reports sent" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: false, message: "Invalid type" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Internal error", details: e }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};

serve(handler);
