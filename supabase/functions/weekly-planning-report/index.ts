import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

// --- ENV VARS ---
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

const RESEND_FROM = Deno.env.get("RESEND_FROM")!; // "Gadait Team <team@gadait-international.com>"
const RESEND_TO = Deno.env.get("RESEND_TO")!; // "pierre@gadait-international.com"

// --- CLIENTS ---
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

// --- MANAGERS (toi + Christelle par ex.) ---
const EXTRA_MANAGER_EMAILS = ["christelle@gadait-international.com"];

const MANAGER_RECIPIENTS = [
  ...RESEND_TO.split(",")
    .map((email) => email.trim())
    .filter(Boolean),
  ...EXTRA_MANAGER_EMAILS,
];

// Mode : si false => uniquement managers reçoivent les mails (phase test).
// Si true  => mail envoyé à l’agent et managers en copie.
const SEND_TO_AGENTS = false;

// On commence avec ces 4 agents (filtre par EMAIL)
const FOCUS_AGENT_EMAILS = [
  "jade@gadait-international.com",
  "franck.fontaine@gadait-international.com", // adresse correcte
  "fleurs@gadait-international.com",
  "matthieu@gadait-international.com",
];

// --- TYPES ---
interface TeamMember {
  id: string;
  name: string;
  email: string | null;
}

interface PlannedAction {
  lead_id: string;
  pipeline: string | null;
  type: string;
  scheduled_at: string; // ISO string
  is_key: boolean; // compromis / acte / contrat loc / visite
}

interface AgentPlanning {
  upcoming: PlannedAction[];
  overdue: PlannedAction[];
  counts: {
    totalUpcoming: number;
    totalOverdue: number;
    compromis: number;
    acteVente: number;
    contratLocation: number;
    visites: number;
  };
}

// --- CORS ---
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// --- HELPERS DATES ---

// Date du jour à 00:00 en heure de Paris
function getParisToday(): Date {
  const now = new Date();
  const paris = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Paris" }));
  paris.setHours(0, 0, 0, 0);
  return paris;
}

// Lundi de la semaine à venir (si on est Lundi, on prend aujourd’hui)
function getNextMonday(): Date {
  const today = getParisToday();
  const day = today.getDay(); // 0=dim, 1=lun, ...
  // nb de jours à ajouter pour arriver au lundi (1)
  const diff = (1 - day + 7) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getComingWeekRange() {
  const weekStart = getNextMonday(); // lundi 00:00
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7); // lundi suivant
  return { weekStart, weekEnd };
}

// Parse date d’une action
function getActionScheduledDate(action: any): Date | null {
  if (!action.scheduledDate) return null;
  const d = new Date(action.scheduledDate);
  if (isNaN(d.getTime())) return null;
  return d;
}

// Détecter les emails auto (à exclure)
function isAutoEmail(actionTypeRaw: any): boolean {
  if (!actionTypeRaw) return false;
  const t = String(actionTypeRaw).toLowerCase();
  return t.startsWith("email auto");
}

function formatDateFr(d: Date): string {
  return d.toLocaleString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// --- DATA FETCHERS ---

// Agents ciblés (par email)
async function getFocusedAgents(): Promise<TeamMember[]> {
  const { data, error } = await supabase.from("team_members").select("id, name, email").in("email", FOCUS_AGENT_EMAILS);

  if (error || !data) {
    console.error("Error fetching focused agents:", error);
    return [];
  }
  return data as TeamMember[];
}

// Planning pour 1 agent (actions à venir + en retard)
async function getPlanningForAgent(agentId: string): Promise<AgentPlanning> {
  const { weekStart, weekEnd } = getComingWeekRange();
  const todayStart = getParisToday();

  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, pipeline_type, action_history")
    .eq("assigned_to", agentId)
    .is("deleted_at", null);

  if (error || !leads) {
    console.error("Error fetching leads for agent:", agentId, error);
    return {
      upcoming: [],
      overdue: [],
      counts: {
        totalUpcoming: 0,
        totalOverdue: 0,
        compromis: 0,
        acteVente: 0,
        contratLocation: 0,
        visites: 0,
      },
    };
  }

  const upcoming: PlannedAction[] = [];
  const overdue: PlannedAction[] = [];

  let compromis = 0;
  let acteVente = 0;
  let contratLocation = 0;
  let visites = 0;

  for (const lead of leads) {
    const leadId = lead.id as string;
    const pipeline = (lead as any).pipeline_type as string | null;

    if (!lead.action_history || !Array.isArray(lead.action_history)) continue;

    for (const action of lead.action_history) {
      const typeRaw = (action.actionType || action.type || "").toString();
      if (isAutoEmail(typeRaw)) continue;

      const scheduled = getActionScheduledDate(action);
      if (!scheduled) continue;

      const completed = action.completedDate ? new Date(action.completedDate) : null;
      const isCompleted = !!completed && !isNaN(completed.getTime());

      // On ne planifie que les actions non terminées
      if (isCompleted) continue;

      const typeLower = typeRaw.toLowerCase();
      const isKey =
        typeLower === "compromis" ||
        typeLower === "acte de vente" ||
        typeLower === "contrat de location" ||
        typeLower === "visites";

      if (scheduled >= weekStart && scheduled < weekEnd) {
        upcoming.push({
          lead_id: leadId,
          pipeline,
          type: typeRaw,
          scheduled_at: scheduled.toISOString(),
          is_key: isKey,
        });

        if (typeLower === "compromis") compromis++;
        if (typeLower === "acte de vente") acteVente++;
        if (typeLower === "contrat de location") contratLocation++;
        if (typeLower === "visites") visites++;
      } else if (scheduled < todayStart) {
        overdue.push({
          lead_id: leadId,
          pipeline,
          type: typeRaw,
          scheduled_at: scheduled.toISOString(),
          is_key: isKey,
        });
      }
    }
  }

  // tri par date
  upcoming.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  overdue.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  return {
    upcoming,
    overdue,
    counts: {
      totalUpcoming: upcoming.length,
      totalOverdue: overdue.length,
      compromis,
      acteVente,
      contratLocation,
      visites,
    },
  };
}

// --- HTML ---

function buildAgentPlanningHtml(agent: TeamMember, planning: AgentPlanning) {
  const { weekStart, weekEnd } = getComingWeekRange();
  const dateRange = `${weekStart.toLocaleDateString("fr-FR")} - ${weekEnd.toLocaleDateString("fr-FR")}`;

  const upcomingRows =
    planning.upcoming.length === 0
      ? `<tr><td colspan="4" style="color:#9ca3af;">Aucune action planifiée sur la semaine à venir.</td></tr>`
      : planning.upcoming
          .map((a) => {
            const d = new Date(a.scheduled_at);
            const badgeClass = a.is_key ? "badge-warning" : "badge-info";
            return `
        <tr>
          <td>${formatDateFr(d)}</td>
          <td><span class="badge ${badgeClass}">${a.type}</span></td>
          <td>${a.pipeline ?? "-"}</td>
          <td>${a.lead_id}</td>
        </tr>
      `;
          })
          .join("");

  const overdueRows =
    planning.overdue.length === 0
      ? `<tr><td colspan="4" style="color:#9ca3af;">Aucune action en retard 🎯</td></tr>`
      : planning.overdue
          .map((a) => {
            const d = new Date(a.scheduled_at);
            const badgeClass = a.is_key ? "badge-warning" : "badge-muted";
            return `
        <tr>
          <td>${formatDateFr(d)}</td>
          <td><span class="badge ${badgeClass}">${a.type}</span></td>
          <td>${a.pipeline ?? "-"}</td>
          <td>${a.lead_id}</td>
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
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #111827; max-width: 900px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%); color:#fff; padding:24px; border-radius:12px; margin-bottom:24px; }
    .header h1 { margin:0; font-size:24px; }
    .header p { margin:4px 0 0; opacity:.9; }
    .stats-grid { display:grid; grid-template-columns: repeat(auto-fit,minmax(160px,1fr)); gap:12px; margin:24px 0; }
    .stat-card { background:#fff; border:1px solid #e5e7eb; border-radius:10px; padding:14px; text-align:center; }
    .stat-label { font-size:12px; text-transform:uppercase; letter-spacing:.06em; color:#6b7280; }
    .stat-value { font-size:22px; font-weight:700; margin-top:6px; color:#111827; }
    .section { background:#fff; border:1px solid #e5e7eb; border-radius:10px; padding:18px; margin-bottom:18px; }
    .section-title { font-size:16px; font-weight:600; margin-bottom:10px; border-bottom:2px solid #e5e7eb; padding-bottom:6px; color:#111827; }
    table { width:100%; border-collapse:collapse; }
    th { background:#f9fafb; padding:8px 10px; text-align:left; font-size:12px; font-weight:600; color:#374151; border-bottom:1px solid #e5e7eb; }
    td { padding:8px 10px; border-bottom:1px solid #f3f4f6; font-size:13px; }
    tr:last-child td { border-bottom:none; }
    .badge { display:inline-block; padding:3px 9px; border-radius:999px; font-size:11px; font-weight:600; }
    .badge-info { background:#dbeafe; color:#1d4ed8; }
    .badge-warning { background:#fef3c7; color:#92400e; }
    .badge-muted { background:#e5e7eb; color:#4b5563; }
    .footer { text-align:center; margin-top:20px; font-size:12px; color:#6b7280; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🗓️ Plan d'action de la semaine - ${agent.name}</h1>
    <p>Gadait International CRM</p>
    <p>Planification du ${dateRange}</p>
  </div>

  <p>Bonjour ${agent.name.split(" ")[0]},</p>
  <p>Voici ton plan d'action pour la semaine à venir, avec les points clés à prioriser.</p>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Actions prévues</div>
      <div class="stat-value">${planning.counts.totalUpcoming}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Actions en retard</div>
      <div class="stat-value">${planning.counts.totalOverdue}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Compromis / Actes / Contrats loc.</div>
      <div class="stat-value">
        ${planning.counts.compromis + planning.counts.acteVente + planning.counts.contratLocation}
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Visites planifiées</div>
      <div class="stat-value">${planning.counts.visites}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">✅ Actions à venir cette semaine</div>
    <table>
      <thead>
        <tr>
          <th>Date & heure</th>
          <th>Type</th>
          <th>Pipeline</th>
          <th>ID lead</th>
        </tr>
      </thead>
      <tbody>
        ${upcomingRows}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">⚠️ Actions en retard à régulariser</div>
    <table>
      <thead>
        <tr>
          <th>Date prévue</th>
          <th>Type</th>
          <th>Pipeline</th>
          <th>ID lead</th>
        </tr>
      </thead>
      <tbody>
        ${overdueRows}
      </tbody>
    </table>
  </div>

  <p>Bonne semaine, et vois avec la direction si tu souhaites ajuster certaines priorités.</p>

  <div class="footer">
    Rapport de planification généré automatiquement par Gadait CRM.
  </div>
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
    console.log("🚀 Generating weekly planning reports (per agent)...");

    const agents = await getFocusedAgents();
    if (agents.length === 0) {
      console.log("No focused agents found.");
      return new Response(JSON.stringify({ success: false, message: "No agents found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: any[] = [];

    for (const agent of agents) {
      const planning = await getPlanningForAgent(agent.id);
      const html = buildAgentPlanningHtml(agent, planning);

      let to: string[] = [];
      let cc: string[] = [];

      if (SEND_TO_AGENTS && agent.email) {
        to = [agent.email];
        cc = MANAGER_RECIPIENTS;
      } else {
        // mode test : uniquement managers
        to = MANAGER_RECIPIENTS;
        cc = [];
      }

      const { data, error } = await resend.emails.send({
        from: RESEND_FROM,
        to,
        cc,
        subject: `🗓️ Plan d'action de la semaine - ${agent.name}`,
        html,
      });

      if (error) {
        console.error(`❌ Error sending planning for ${agent.name}:`, error);
        results.push({ agent: agent.name, success: false, error });
      } else {
        console.log(`✅ Planning sent for ${agent.name}:`, data);
        results.push({ agent: agent.name, success: true });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Planning reports processed",
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err: unknown) {
    console.error("❌ Error in weekly-planning-report:", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: "Internal server error", details: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
