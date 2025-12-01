import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

// --- ENV VARS ---
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

const RESEND_FROM = Deno.env.get("RESEND_FROM")!; // "Gadait Team <team@gadait-international.com>"
const RESEND_TO = Deno.env.get("RESEND_TO")!; // "pierre@gadait-international.com"

// URL de base pour ouvrir un lead dans Success (à ADAPTER si besoin)
const SUCCESS_LEAD_BASE_URL = Deno.env.get("SUCCESS_LEAD_BASE_URL") ?? "https://crm.gadait-international.com/leads";

// --- CLIENTS ---
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

// --- MANAGERS EN COPIE : RESEND_TO + Christelle ---
const EXTRA_MANAGER_EMAILS = ["christelle@gadait-international.com"];

const MANAGER_RECIPIENTS = [
  ...RESEND_TO.split(",")
    .map((email) => email.trim())
    .filter(Boolean),
  ...EXTRA_MANAGER_EMAILS,
];

// Pour l'instant : on n’envoie PAS aux agents directement
const SEND_TO_AGENTS = false;

// On commence avec ces 4 agents (filtre par EMAIL)
const FOCUS_AGENT_EMAILS = [
  "jade@gadait-international.com",
  "franck.fontaine@gadait-international.com",
  "fleurs@gadait-international.com",
  "matthieu@gadait-international.com",
];

// --- TYPES ---
interface TeamMember {
  id: string;
  name: string;
  email: string | null;
}

interface ActionRow {
  scheduledDate: Date;
  type: string;
  pipeline: string;
  leadId: string;
  leadName: string;
  notes: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// --- HELPERS GÉNÉRAUX ---

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function getParisToday(): Date {
  const now = new Date();
  const paris = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Paris" }));
  paris.setHours(0, 0, 0, 0);
  return paris;
}

function escapeHtml(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return value.slice(0, max - 1) + "…";
}

function formatDateFr(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

function getLeadDisplayName(lead: any): string {
  return lead.full_name || lead.name || `${lead.first_name ?? ""} ${lead.last_name ?? ""}`.trim() || `Lead #${lead.id}`;
}

function makeLeadUrl(leadId: string): string {
  // Ajuste ce pattern si ton URL de Success est différente
  return `${SUCCESS_LEAD_BASE_URL}/${leadId}`;
}

// Noms lisibles & cliquables même sur mobile
function formatLeadNameHtml(name: string, url?: string | null): string {
  const safe = escapeHtml(name || "Lead");
  const withNbsp = safe.replace(/ /g, "&nbsp;");

  const inner = `<span style="white-space:nowrap;">${withNbsp}</span>`;

  if (!url) return inner;

  return `
    <a 
      href="${url}" 
      style="
        color:#2563eb;
        text-decoration:underline;
        font-weight:500;
        display:inline-block;
        max-width:160px;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
      "
    >
      ${withNbsp}
    </a>
  `;
}

function isAutoEmail(actionTypeRaw: any): boolean {
  if (!actionTypeRaw) return false;
  const t = String(actionTypeRaw).toLowerCase();
  return t.startsWith("email auto");
}

// --- DATA FETCHERS ---

async function getFocusedAgents(): Promise<TeamMember[]> {
  const { data, error } = await supabase.from("team_members").select("id, name, email").in("email", FOCUS_AGENT_EMAILS);

  if (error || !data) {
    console.error("Error fetching focused agents:", error);
    return [];
  }

  return data as TeamMember[];
}

async function getAgentActions(agentId: string): Promise<{
  overdue: ActionRow[];
  upcoming: ActionRow[];
}> {
  const today = getParisToday();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, full_name, name, first_name, last_name, pipeline_type, action_history")
    .eq("assigned_to", agentId)
    .is("deleted_at", null);

  if (error || !leads) {
    console.error("Error fetching leads for agent", agentId, error);
    return { overdue: [], upcoming: [] };
  }

  const overdue: ActionRow[] = [];
  const upcoming: ActionRow[] = [];

  for (const lead of leads) {
    const pipeline = lead.pipeline_type || "—";
    const leadName = getLeadDisplayName(lead);
    const leadId = lead.id as string;

    if (!Array.isArray(lead.action_history)) continue;

    for (const action of lead.action_history) {
      const typeRaw = (action.actionType || action.type || "").toString();
      if (isAutoEmail(typeRaw)) continue;

      if (!action.scheduledDate) continue;

      const sched = new Date(action.scheduledDate);
      if (isNaN(sched.getTime())) continue;

      const completed = action.completedDate ? new Date(action.completedDate) : null;
      const isCompleted = completed && !isNaN(completed.getTime());

      // On ne s'intéresse qu'aux actions non complétées
      if (isCompleted) continue;

      const row: ActionRow = {
        scheduledDate: sched,
        type: typeRaw || "Action",
        pipeline,
        leadId,
        leadName,
        notes: action.notes || action.comment || action.description || "",
      };

      if (sched < today) {
        overdue.push(row);
      } else if (sched >= today && sched < nextWeek) {
        upcoming.push(row);
      }
    }
  }

  // Tri par date
  overdue.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
  upcoming.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());

  return { overdue, upcoming };
}

// --- HTML ---

function buildAgentActionPlanHtml(agent: TeamMember, overdue: ActionRow[], upcoming: ActionRow[]): string {
  const today = getParisToday();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const rangeLabel = `${today.toLocaleDateString("fr-FR")} - ${nextWeek.toLocaleDateString("fr-FR")}`;

  const overdueRows =
    overdue.length === 0
      ? `<tr><td colspan="5" style="color:#9ca3af; padding:12px;">Aucune action en retard 🎯</td></tr>`
      : overdue
          .map((a) => {
            const date = formatDateFr(a.scheduledDate);
            const notes = truncate(escapeHtml(a.notes || ""), 120);
            const leadLink = formatLeadNameHtml(a.leadName, makeLeadUrl(a.leadId));

            return `
              <tr>
                <td>${date}</td>
                <td>${escapeHtml(a.type)}</td>
                <td>${escapeHtml(a.pipeline)}</td>
                <td>${leadLink}</td>
                <td>${notes}</td>
              </tr>
            `;
          })
          .join("");

  const upcomingRows =
    upcoming.length === 0
      ? `<tr><td colspan="5" style="color:#9ca3af; padding:12px;">Aucune action planifiée sur les 7 prochains jours.</td></tr>`
      : upcoming
          .map((a) => {
            const date = formatDateFr(a.scheduledDate);
            const notes = truncate(escapeHtml(a.notes || ""), 120);
            const leadLink = formatLeadNameHtml(a.leadName, makeLeadUrl(a.leadId));

            return `
              <tr>
                <td>${date}</td>
                <td>${escapeHtml(a.type)}</td>
                <td>${escapeHtml(a.pipeline)}</td>
                <td>${leadLink}</td>
                <td>${notes}</td>
              </tr>
            `;
          })
          .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #111827;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9fafb;
    }
    .header {
      background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
      color: #fff;
      padding: 22px;
      border-radius: 12px;
      margin-bottom: 24px;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
    }
    .header p {
      margin: 4px 0 0;
      opacity: 0.9;
      font-size: 13px;
    }
    .section {
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      padding: 18px;
      margin-bottom: 18px;
    }
    .section-title {
      font-size: 17px;
      font-weight: 600;
      margin: 0 0 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .section-title span.icon {
      font-size: 18px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    th {
      text-align: left;
      padding: 8px 10px;
      background: #f3f4f6;
      font-weight: 600;
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
      white-space: nowrap;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #f3f4f6;
      vertical-align: top;
    }
    tr:last-child td {
      border-bottom: none;
    }
    .note {
      color: #4b5563;
    }
    .hint {
      font-size: 12px;
      color: #6b7280;
      margin-top: 8px;
    }
    @media (max-width: 600px) {
      body {
        padding: 12px;
      }
      table {
        font-size: 12px;
      }
      th, td {
        padding: 6px 6px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔥 Plan d'actions - ${escapeHtml(agent.name)}</h1>
    <p>Gadait International · Période ${rangeLabel}</p>
  </div>

  <p>Bonjour ${escapeHtml(agent.name.split(" ")[0] || agent.name)},</p>
  <p>Voici ton récapitulatif des actions à rattraper et de celles prévues sur la semaine à venir.</p>

  <div class="section">
    <h2 class="section-title">
      <span class="icon">🚨</span>
      <span>Actions en retard à rattraper</span>
    </h2>
    <table>
      <thead>
        <tr>
          <th>Date prévue</th>
          <th>Type</th>
          <th>Pipeline</th>
          <th>Lead</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        ${overdueRows}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2 class="section-title">
      <span class="icon">📅</span>
      <span>Actions planifiées sur les 7 prochains jours</span>
    </h2>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Pipeline</th>
          <th>Lead</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        ${upcomingRows}
      </tbody>
    </table>
    <p class="hint">
      Les noms des leads sont cliquables pour ouvrir directement leur fiche dans Success.
    </p>
  </div>

  <p class="note">
    Objectif : terminer les actions en retard dès que possible, et sécuriser les visites, compromis,
    actes de vente et contrats de location prévus cette semaine.
  </p>

  <p>Bonne semaine 🙌</p>

  <p style="font-size:12px; color:#9ca3af; margin-top:24px;">
    Rapport généré automatiquement par Gadait CRM.
  </p>
</body>
</html>
  `;
}

// --- HANDLER ---

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 Generating weekly agent action plans...");

    const agents = await getFocusedAgents();
    if (agents.length === 0) {
      console.log("No focused agents found.");
      return new Response(JSON.stringify({ success: false, message: "No agents found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: any[] = [];
    let index = 0;

    for (const agent of agents) {
      if (index > 0) {
        // On espace les appels pour respecter le rate limit Resend
        await sleep(1200);
      }
      index++;

      const { overdue, upcoming } = await getAgentActions(agent.id);
      const html = buildAgentActionPlanHtml(agent, overdue, upcoming);

      const to: string[] = [];
      const cc: string[] = [];

      if (SEND_TO_AGENTS && agent.email) {
        to.push(agent.email);
        cc.push(...MANAGER_RECIPIENTS);
      } else {
        to.push(...MANAGER_RECIPIENTS);
      }

      const { data, error } = await resend.emails.send({
        from: RESEND_FROM,
        to,
        cc: cc.length ? cc : undefined,
        subject: `🔥 Plan d'actions de la semaine - ${agent.name}`,
        html,
      });

      if (error) {
        console.error(`❌ Error sending action plan for ${agent.name}:`, error);
        results.push({ agent: agent.name, success: false, error });
      } else {
        console.log(`✅ Action plan sent for ${agent.name}:`, data);
        results.push({ agent: agent.name, success: true, data });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Agent action plans processed",
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err: unknown) {
    console.error("❌ Error in weekly-agent-action-plan:", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: "Internal server error", details: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
