import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

// --- ENV VARS (mêmes que pour tes autres rapports) ---
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

const RESEND_FROM = Deno.env.get("RESEND_FROM")!; // "Gadait Team <team@gadait-international.com>"
const RESEND_TO = Deno.env.get("RESEND_TO")!; // "pierre@gadait-international.com"

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

// Les destinataires managers (toi + éventuellement d'autres via RESEND_TO)
const MANAGER_RECIPIENTS = RESEND_TO.split(",")
  .map((email) => email.trim())
  .filter(Boolean);

// Agents ciblés pour le planning (par EMAIL)
const FOCUS_AGENT_EMAILS = [
  "jade@gadait-international.com",
  "franck.fontaine@gadait-international.com",
  "fleurs@gadait-international.com",
  "matthieu@gadait-international.com",
];

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

interface AgentPlanningSummary {
  upcoming: PlanningAction[];
  overdue: PlanningAction[];
  counts: {
    totalUpcoming: number;
    totalOverdue: number;
    visites: number;
    compromis: number;
    acteVente: number;
    contratLocation: number;
  };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ---- HELPERS ----

function getParisDate(daysAgo: number = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const parisDate = new Date(date.toLocaleString("en-US", { timeZone: "Europe/Paris" }));
  parisDate.setHours(0, 0, 0, 0);
  return parisDate;
}

function getParisNow(): Date {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "Europe/Paris" }));
}

// Prochaine "fenêtre" de 7 jours à partir d'aujourd'hui (0h Paris)
function getComingWeekRange() {
  const start = getParisDate(0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return {
    startDate: start,
    endDate: end,
  };
}

// Date de référence pour l'action (pour le planning on utilise surtout scheduledDate)
function getActionStatDate(action: any): Date | null {
  const dateStr = action.scheduledDate || action.completedDate || action.createdAt || action.date;

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

function formatDateFR(d: Date | null): string {
  if (!d || isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
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

// ---- DATA FETCHERS ----

// Agents ciblés par EMAIL
async function getFocusedAgents(): Promise<TeamMember[]> {
  const { data, error } = await supabase.from("team_members").select("id, name, email").in("email", FOCUS_AGENT_EMAILS);

  if (error || !data) {
    console.error("Error fetching focused agents:", error);
    return [];
  }

  return data as TeamMember[];
}

// Récupère les actions en retard + à venir pour un agent donné
async function getAgentPlanning(agentId: string): Promise<AgentPlanningSummary> {
  const { startDate, endDate } = getComingWeekRange();
  const parisNow = getParisNow();

  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, name, pipeline_type, action_history")
    .eq("assigned_to", agentId)
    .is("deleted_at", null);

  if (error || !leads) {
    console.error("Error fetching leads for planning:", error);
    return {
      upcoming: [],
      overdue: [],
      counts: {
        totalUpcoming: 0,
        totalOverdue: 0,
        visites: 0,
        compromis: 0,
        acteVente: 0,
        contratLocation: 0,
      },
    };
  }

  const upcoming: PlanningAction[] = [];
  const overdue: PlanningAction[] = [];

  let visitesCount = 0;
  let compromisCount = 0;
  let acteVenteCount = 0;
  let contratLocationCount = 0;

  for (const lead of leads as any[]) {
    const leadId = lead.id as string;
    const leadName = (lead.name as string) || "Lead sans nom";
    const pipeline = (lead.pipeline_type as string) || null;

    if (!lead.action_history || !Array.isArray(lead.action_history)) continue;

    for (const action of lead.action_history) {
      const typeRaw = (action.actionType || action.type || "").toString();
      if (isAutoEmail(typeRaw)) continue;

      const scheduled = action.scheduledDate ? new Date(action.scheduledDate) : null;
      const completed = action.completedDate ? new Date(action.completedDate) : null;

      // Si pas de scheduledDate, ça n'entre pas dans le planning
      if (!scheduled || isNaN(scheduled.getTime())) continue;

      const isOverdue = scheduled < parisNow && !completed;
      const inComingWeek = scheduled >= startDate && scheduled < endDate;

      if (!isOverdue && !inComingWeek) continue;

      const typeLower = typeRaw.toLowerCase();

      if (typeLower === "visites") visitesCount++;
      if (typeLower === "compromis") compromisCount++;
      if (typeLower === "acte de vente") acteVenteCount++;
      if (typeLower === "contrat de location") contratLocationCount++;

      const pa: PlanningAction = {
        lead_id: leadId,
        lead_name: leadName,
        pipeline,
        type: typeRaw,
        scheduled_at: scheduled,
        notes: action.notes || null,
        is_overdue: isOverdue,
      };

      if (isOverdue) {
        overdue.push(pa);
      } else if (inComingWeek) {
        upcoming.push(pa);
      }
    }
  }

  // Tri : en retard -> date croissante, à venir -> date croissante
  overdue.sort((a, b) => {
    if (!a.scheduled_at || !b.scheduled_at) return 0;
    return a.scheduled_at.getTime() - b.scheduled_at.getTime();
  });

  upcoming.sort((a, b) => {
    if (!a.scheduled_at || !b.scheduled_at) return 0;
    return a.scheduled_at.getTime() - b.scheduled_at.getTime();
  });

  return {
    upcoming,
    overdue,
    counts: {
      totalUpcoming: upcoming.length,
      totalOverdue: overdue.length,
      visites: visitesCount,
      compromis: compromisCount,
      acteVente: acteVenteCount,
      contratLocation: contratLocationCount,
    },
  };
}

// ---- HTML BUILDER ----

function buildAgentPlanningHtml(agent: TeamMember, planning: AgentPlanningSummary): string {
  const { startDate, endDate } = getComingWeekRange();

  const dateRange = `${startDate.toLocaleDateString(
    "fr-FR",
  )} - ${new Date(endDate.getTime() - 1).toLocaleDateString("fr-FR")}`;

  const firstName = agent.name.split(" ")[0];

  // Bandeau alerte si beaucoup de retard
  const overdueAlert =
    planning.counts.totalOverdue >= 10
      ? `
  <div style="background:#fee2e2;color:#b91c1c;padding:10px 14px;border-radius:8px;margin-bottom:14px;font-size:13px;">
    ⚠️ Tu as <strong>${planning.counts.totalOverdue}</strong> actions en retard.
    L'objectif de la semaine est de revenir à un niveau maîtrisé avant d'ajouter trop de nouveaux dossiers.
  </div>
  `
      : "";

  // Coaching simple
  let coaching = "";
  if (planning.counts.totalOverdue > 0 && planning.counts.totalUpcoming > 0) {
    coaching =
      "Commence par les actions en retard les plus anciennes, puis concentre-toi sur les visites et dossiers les plus proches du compromis / acte.";
  } else if (planning.counts.totalOverdue > 0) {
    coaching =
      "Ta priorité cette semaine est de régulariser les actions en retard pour sécuriser la relation avec les leads.";
  } else if (planning.counts.totalUpcoming > 0) {
    coaching =
      "Tu es à jour sur tes actions : profite-en pour transformer tes visites et suivis en offres, compromis et actes.";
  } else {
    coaching =
      "Tu n'as pas encore d'actions planifiées sur la semaine : pense à programmer tes prochains suivis dans Success.";
  }

  const upcomingRows =
    planning.upcoming.length === 0
      ? `<tr><td colspan="5" style="color:#9ca3af;font-size:13px;">Aucune action planifiée dans les 7 prochains jours.</td></tr>`
      : planning.upcoming
          .map((a) => {
            const leadUrl = `https://success.gadait-international.com/leads/${a.lead_id}`;
            const notes = a.notes && a.notes.length > 80 ? a.notes.slice(0, 77) + "..." : a.notes || "";
            return `
        <tr>
          <td>${formatDateFR(a.scheduled_at)}</td>
          <td>${a.type}</td>
          <td>${a.pipeline || "-"}</td>
          <td>
            <a href="${leadUrl}" style="color:#2563eb;text-decoration:none;">
              ${a.lead_name}
            </a>
          </td>
          <td>${notes}</td>
        </tr>
      `;
          })
          .join("");

  const overdueRows =
    planning.overdue.length === 0
      ? `<tr><td colspan="5" style="color:#9ca3af;font-size:13px;">Aucune action en retard 🎯</td></tr>`
      : planning.overdue
          .map((a) => {
            const leadUrl = `https://success.gadait-international.com/leads/${a.lead_id}`;
            const notes = a.notes && a.notes.length > 80 ? a.notes.slice(0, 77) + "..." : a.notes || "";
            return `
        <tr>
          <td>${formatDateFR(a.scheduled_at)}</td>
          <td>${a.type}</td>
          <td>${a.pipeline || "-"}</td>
          <td>
            <a href="${leadUrl}" style="color:#b91c1c;text-decoration:none;">
              ${a.lead_name}
            </a>
          </td>
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
    body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#111827;max-width:900px;margin:0 auto;padding:20px;background:#f9fafb; }
    .header { background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);color:white;padding:24px 26px;border-radius:12px;margin-bottom:24px; }
    .header h1 { margin:0;font-size:22px; }
    .header p { margin:4px 0 0 0;opacity:0.9;font-size:13px; }
    .stats-grid { display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin:18px 0 8px 0; }
    .stat-card { background:white;border-radius:10px;padding:14px;border:1px solid #e5e7eb;text-align:center; }
    .stat-label { font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em; }
    .stat-value { font-size:22px;font-weight:700;color:#4f46e5;margin-top:4px; }
    .section { background:white;border-radius:10px;border:1px solid #e5e7eb;padding:18px;margin-bottom:18px; }
    .section-title { font-size:16px;font-weight:600;margin-bottom:10px;color:#111827;border-bottom:2px solid #e5e7eb;padding-bottom:6px; }
    table { width:100%;border-collapse:collapse;margin-top:4px; }
    th { background:#f9fafb;padding:8px 8px;text-align:left;font-size:12px;color:#374151;border-bottom:1px solid #e5e7eb; }
    td { padding:7px 8px;font-size:12px;border-bottom:1px solid #f3f4f6;vertical-align:top; }
    tr:last-child td { border-bottom:none; }
    .badge { display:inline-block;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:600; }
    .badge-info { background:#dbeafe;color:#1d4ed8; }
    .badge-success { background:#dcfce7;color:#166534; }
    .badge-warning { background:#fef3c7;color:#92400e; }
    .small-text { font-size:12px;color:#6b7280; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🗓️ Plan d'Actions - ${agent.name}</h1>
    <p>Semaine du ${dateRange}</p>
  </div>

  <p>Bonjour ${firstName},</p>
  <p>Voici ton plan d'action pour les prochains jours : actions en retard à rattraper et rendez-vous déjà planifiés.</p>

  ${overdueAlert}

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Actions à venir</div>
      <div class="stat-value">${planning.counts.totalUpcoming}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Actions en retard</div>
      <div class="stat-value">${planning.counts.totalOverdue}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Visites à réaliser</div>
      <div class="stat-value">${planning.counts.visites}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Dossiers à closer</div>
      <div class="stat-value">${planning.counts.compromis + planning.counts.acteVente + planning.counts.contratLocation}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">🔥 Actions en retard à rattraper</div>
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
    <div class="section-title">📅 Actions planifiées sur les 7 prochains jours</div>
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
    <p class="small-text">Les leads sont cliquables pour ouvrir directement la fiche dans Success.</p>
  </div>

  <div class="section">
    <div class="section-title">🎯 Focus de la semaine</div>
    <p class="small-text">${coaching}</p>
  </div>

  <p class="small-text">Ce planning est généré automatiquement à partir des actions Success (hors emails automatiques J+). Si tu vois une incohérence, signale-le à la direction.</p>

  <p class="small-text">Bonne semaine 🙌</p>

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
    console.log("🚀 Generating weekly planning reports for agents...");

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
      const planning = await getAgentPlanning(agent.id);

      // Si aucun contenu (ni actions en retard ni à venir), on ne spam pas
      if (planning.counts.totalUpcoming === 0 && planning.counts.totalOverdue === 0) {
        console.log(`ℹ️ No planning for ${agent.name}, skipping email.`);
        results.push({
          agent: agent.name,
          success: true,
          skipped: true,
          reason: "no_actions",
        });
        continue;
      }

      const html = buildAgentPlanningHtml(agent, planning);

      // Pour le moment : envoi UNIQUEMENT aux managers (toi + Christelle via RESEND_TO)
      const { data, error } = await resend.emails.send({
        from: RESEND_FROM,
        to: MANAGER_RECIPIENTS,
        subject: `🗓️ Plan d'Actions - ${agent.name}`,
        html,
      });

      if (error) {
        console.error(`❌ Error sending planning for ${agent.name}:`, error);
        results.push({ agent: agent.name, success: false, error });
      } else {
        console.log(`✅ Planning sent for ${agent.name}:`, data);
        results.push({ agent: agent.name, success: true, data });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Agent planning reports processed",
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err: unknown) {
    console.error("❌ Error in weekly-agent-planning:", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: "Internal server error", details: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
