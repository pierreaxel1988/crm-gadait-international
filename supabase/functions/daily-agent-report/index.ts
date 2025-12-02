import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

// --- ENV VARS ---
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
const RESEND_FROM = Deno.env.get("RESEND_FROM")!;
const RESEND_TO = Deno.env.get("RESEND_TO")!;
const SUCCESS_LEAD_BASE_URL =
  Deno.env.get("SUCCESS_LEAD_BASE_URL") ?? "https://success.gadait-international.com/leads";

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

// ---- MANAGERS / AGENTS ----
const EXTRA_MANAGER_EMAILS = ["christelle@gadait-international.com"];

const MANAGER_RECIPIENTS = [
  ...RESEND_TO.split(",").map((e) => e.trim()).filter(Boolean),
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

// ---- HELPERS ----

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getParisDate(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const p = new Date(d.toLocaleString("en-US", { timeZone: "Europe/Paris" }));
  p.setHours(0, 0, 0, 0);
  return p;
}

function getParisNow() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Paris" }));
}

function escapeHtml(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatDateFR(d: Date | null): string {
  if (!d) return "-";
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : value.slice(0, max - 1) + "…";
}

function makeLeadUrl(id: string) {
  return `${SUCCESS_LEAD_BASE_URL}/${id}`;
}

function isAutoEmail(type: string) {
  return type.toLowerCase().startsWith("email auto");
}

// ---- FETCH AGENTS ----
async function getFocusedAgents(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from("team_members")
    .select("id, name, email")
    .in("email", FOCUS_AGENT_EMAILS);

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

// ---- DAILY REPORT LOGIC ----
async function getAgentDailyPlanning(agentId: string) {
  const { startDate, endDate } = getParisTodayRange();
  const now = getParisNow();

  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, name, pipeline_type, action_history")
    .eq("assigned_to", agentId)
    .is("deleted_at", null);

  if (error || !leads) {
    return { today: [], overdue: [], counts: { today: 0, overdue: 0 } };
  }

  const today: PlanningAction[] = [];
  const overdue: PlanningAction[] = [];

  for (const lead of leads as any[]) {
    const leadId = lead.id;
    const leadName = lead.name || "Lead sans nom";
    const pipeline = lead.pipeline_type;

    for (const action of lead.action_history || []) {
      const type = (action.actionType || action.type || "").toString();
      if (isAutoEmail(type)) continue;

      const scheduled = action.scheduledDate ? new Date(action.scheduledDate) : null;
      const completed = action.completedDate ? new Date(action.completedDate) : null;

      if (!scheduled || isNaN(scheduled.getTime())) continue;

      const is_overdue = scheduled < now && !completed;
      const is_today = scheduled >= startDate && scheduled < endDate;

      if (!is_overdue && !is_today) continue;

      const pa: PlanningAction = {
        lead_id: leadId,
        lead_name: leadName,
        pipeline,
        type,
        scheduled_at: scheduled,
        notes: action.notes,
        is_overdue,
      };

      if (is_overdue) overdue.push(pa);
      else today.push(pa);
    }
  }

  today.sort((a, b) => a.scheduled_at!.getTime() - b.scheduled_at!.getTime());
  overdue.sort((a, b) => a.scheduled_at!.getTime() - b.scheduled_at!.getTime());

  return {
    today,
    overdue,
    counts: {
      today: today.length,
      overdue: overdue.length,
    },
  };
}

function buildDailyReportHtml(agent: TeamMember, summary: any) {
  const firstName = agent.name.split(" ")[0];

  const listToday =
    summary.today.length === 0
      ? "<li>Aucune action prévue</li>"
      : summary.today
          .map((a: PlanningAction) => {
            return `<li><strong>${formatDateFR(a.scheduled_at)}</strong> – ${a.type} – <a href="${makeLeadUrl(
              a.lead_id,
            )}">${escapeHtml(a.lead_name)}</a></li>`;
          })
          .join("");

  const listOverdue =
    summary.overdue.length === 0
      ? "<li>Aucun retard 🎯</li>"
      : summary.overdue
          .map((a: PlanningAction) => {
            return `<li><strong>${formatDateFR(a.scheduled_at)}</strong> – ${a.type} – <a href="${makeLeadUrl(
              a.lead_id,
            )}">${escapeHtml(a.lead_name)}</a></li>`;
          })
          .join("");

  return `
  <html>
  <body style="font-family: Arial; padding: 20px; color: #111;">
    <h2>📅 Rapport journalier – ${escapeHtml(agent.name)}</h2>
    <p>Bonjour ${escapeHtml(firstName)}, voici ton résumé du jour.</p>

    <h3>🔥 Actions en retard (${summary.counts.overdue})</h3>
    <ul>${listOverdue}</ul>

    <h3>🗓️ Actions du jour (${summary.counts.today})</h3>
    <ul>${listToday}</ul>

    <p style="color:#777;font-size:12px;">Rapport généré automatiquement via Success.</p>
  </body>
  </html>
  `;
}

async function sendDailyReports() {
  console.log("📨 Sending DAILY reports...");
  const agents = await getFocusedAgents();
  if (agents.length === 0) return;

  for (const agent of agents) {
    const summary = await getAgentDailyPlanning(agent.id);

    if (summary.counts.today === 0 && summary.counts.overdue === 0) {
      console.log(`No daily content for ${agent.name}`);
      continue;
    }

    const html = buildDailyReportHtml(agent, summary);

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

// ---- HTTP HANDLER ----
const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const type = url.searchParams.get("type");

  try {
    if (type === "daily") {
      await sendDailyReports();
      return new Response(
        JSON.stringify({ success: true, message: "Daily reports sent" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: "Invalid type" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Internal error", details: e }),
      { status: 500, headers: corsHeaders },
    );
  }
};

serve(handler);
