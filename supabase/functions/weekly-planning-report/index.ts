// supabase/functions/weekly-planning-report/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

// --- ENV VARS ---
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

const RESEND_FROM = Deno.env.get("RESEND_FROM")!; // "Gadait Team <team@gadait-international.com>"
const RESEND_TO = Deno.env.get("RESEND_TO")!;     // "pierre@gadait-international.com"

// Supabase + Resend
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

// ---- DESTINATAIRES ----
// Managers = RESEND_TO + Christelle
const EXTRA_MANAGER_EMAILS = ["christelle@gadait-international.com"];

const MANAGER_RECIPIENTS = [
  ...RESEND_TO.split(",").map((email) => email.trim()).filter(Boolean),
  ...EXTRA_MANAGER_EMAILS,
];

// ---- TYPES ----
interface TeamMember {
  id: string;
  name: string;
}

interface AgentDayStats {
  dateKey: string;      // "YYYY-MM-DD"
  dateLabel: string;    // "Lundi 02/12/2025"
  total: number;
  call: number;
  follow_up: number;
  visites: number;
  estimation: number;
  propositions: number;
  prospection: number;
  compromis: number;
  acte_vente: number;
  contrat_location: number;
}

interface AgentPlanningSummary {
  agent_id: string;
  agent_name: string;
  days: AgentDayStats[];
  overdueByType: Record<string, number>;
}

// ---- HELPERS DATE / ACTION ----

// Date "0h00" Europe/Paris
function getParisDate(daysOffset = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  const paris = new Date(
    date.toLocaleString("en-US", { timeZone: "Europe/Paris" }),
  );
  paris.setHours(0, 0, 0, 0);
  return paris;
}

// Prochaine semaine = aujourd'hui -> + 7 jours
function getUpcomingWeekRange() {
  const start = getParisDate(0); // aujourd'hui (lundi quand le cron tourne)
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

function getActionStatDate(action: any): Date | null {
  const dateStr =
    action.scheduledDate ||
    action.completedDate ||
    action.createdAt ||
    action.date;

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

function formatDateLabel(d: Date): string {
  const dayNames = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];
  const day = dayNames[d.getDay()];
  const date = d.toLocaleDateString("fr-FR");
  return `${day} ${date}`;
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

// ---- DATA ----

async function getTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from("team_members")
    .select("id, name");

  if (error || !data) {
    console.error("Error fetching team_members:", error);
    return [];
  }
  return data as TeamMember[];
}

async function getWeeklyPlanningByAgent(): Promise<AgentPlanningSummary[]> {
  const { startDate, endDate } = getUpcomingWeekRange();
  const weekStart = new Date(startDate);
  const weekEnd = new Date(endDate);
  const now = new Date();

  const members = await getTeamMembers();
  if (members.length === 0) return [];

  // On récupère tous les leads avec actions + assigned_to
  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, assigned_to, action_history")
    .is("deleted_at", null);

  if (error || !leads) {
    console.error("Error fetching leads:", error);
    return [];
  }

  const map = new Map<string, AgentPlanningSummary>();

  // Préparer la structure de base pour chaque agent
  for (const m of members) {
    const days: AgentDayStats[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);

      days.push({
        dateKey: toDateKey(day),
        dateLabel: formatDateLabel(day),
        total: 0,
        call: 0,
        follow_up: 0,
        visites: 0,
        estimation: 0,
        propositions: 0,
        prospection: 0,
        compromis: 0,
        acte_vente: 0,
        contrat_location: 0,
      });
    }

    map.set(m.id, {
      agent_id: m.id,
      agent_name: m.name,
      days,
      overdueByType: {},
    });
  }

  // Parcours des actions
  for (const lead of leads) {
    const agentId = lead.assigned_to as string | null;
    if (!agentId) continue;
    if (!map.has(agentId)) continue;

    const summary = map.get(agentId)!;
    const days = summary.days;
    const overdueByType = summary.overdueByType;

    if (!lead.action_history || !Array.isArray(lead.action_history)) continue;

    for (const action of lead.action_history) {
      const typeRaw = (action.actionType || action.type || "").toString();
      if (isAutoEmail(typeRaw)) continue;

      const type = typeRaw.toLowerCase();
      const sched = action.scheduledDate ? new Date(action.scheduledDate) : null;
      const statDate = getActionStatDate(action);
      if (!statDate) continue;

      // -------- RETARDS --------
      if (sched && sched < now && !action.completedDate) {
        const key = typeRaw || "Autre";
        overdueByType[key] = (overdueByType[key] || 0) + 1;
      }

      // -------- A VENIR SUR LA SEMAINE --------
      if (!sched || sched < weekStart || sched >= weekEnd) continue;
      if (action.completedDate) continue; // déjà fait

      const dayKey = toDateKey(sched);
      const dayStats = days.find((d) => d.dateKey === dayKey);
      if (!dayStats) continue;

      dayStats.total += 1;

      if (type === "call") dayStats.call++;
      else if (type === "follow up") dayStats.follow_up++;
      else if (type === "visites") dayStats.visites++;
      else if (type === "estimation") dayStats.estimation++;
      else if (type === "propositions") dayStats.propositions++;
      else if (type === "prospection") dayStats.prospection++;
      else if (type === "compromis") dayStats.compromis++;
      else if (type === "acte de vente") dayStats.acte_vente++;
      else if (type === "contrat de location") dayStats.contrat_location++;
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.agent_name.localeCompare(b.agent_name),
  );
}

// ---- HTML ----

function buildPlanningHtml(summaries: AgentPlanningSummary[]): string {
  const { startDate, endDate } = getUpcomingWeekRange();
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setDate(end.getDate() - 1); // on affiche inclusivement

  const dateRange = `${start.toLocaleDateString(
    "fr-FR",
  )} - ${end.toLocaleDateString("fr-FR")}`;

  const agentBlocks =
    summaries.length === 0
      ? "<p>Aucune donnée disponible.</p>"
      : summaries
          .map((s) => {
            const totalOverdue = Object.values(s.overdueByType).reduce(
              (a, b) => a + b,
              0,
            );

            const overdueRows =
              totalOverdue === 0
                ? "<tr><td colspan='2' style='color:#9ca3af;'>Aucune action en retard 👍</td></tr>"
                : Object.entries(s.overdueByType)
                    .map(
                      ([t, c]) => `
                  <tr>
                    <td>${t}</td>
                    <td><span class="badge badge-warning">${c}</span></td>
                  </tr>
                `,
                    )
                    .join("");

            const dayRows = s.days
              .map((d) => {
                if (d.total === 0) {
                  return `
                  <tr>
                    <td>${d.dateLabel}</td>
                    <td>0</td>
                    <td colspan="4" style="color:#9ca3af;">Aucune action programmée</td>
                  </tr>
                `;
                }

                const keyDeals: string[] = [];
                if (d.visites > 0) keyDeals.push(`Visites : ${d.visites}`);
                if (d.compromis > 0) keyDeals.push(`Compromis : ${d.compromis}`);
                if (d.acte_vente > 0)
                  keyDeals.push(`Actes de vente : ${d.acte_vente}`);
                if (d.contrat_location > 0)
                  keyDeals.push(`Contrats loc. : ${d.contrat_location}`);

                const keyDealsText =
                  keyDeals.length > 0
                    ? keyDeals.join(" · ")
                    : "—";

                return `
                <tr>
                  <td>${d.dateLabel}</td>
                  <td><span class="badge badge-info">${d.total}</span></td>
                  <td>Calls / Follow up / Prospection : ${
                    d.call + d.follow_up + d.prospection
                  }</td>
                  <td>Estim. / Prop. : ${
                    d.estimation + d.propositions
                  }</td>
                  <td>${keyDealsText}</td>
                </tr>
              `;
              })
              .join("");

            return `
          <div class="agent-block">
            <h2>${s.agent_name}</h2>

            <div class="sub-section">
              <div class="sub-title">Actions en retard</div>
              <table>
                <thead>
                  <tr>
                    <th>Type d'action</th>
                    <th>Nombre</th>
                  </tr>
                </thead>
                <tbody>
                  ${overdueRows}
                </tbody>
              </table>
            </div>

            <div class="sub-section">
              <div class="sub-title">Actions programmées cette semaine</div>
              <table>
                <thead>
                  <tr>
                    <th>Jour</th>
                    <th>Total actions</th>
                    <th>Contact (call + relances)</th>
                    <th>Avancement (estim. / prop.)</th>
                    <th>Focus deals (visites, compromis, actes, loc.)</th>
                  </tr>
                </thead>
                <tbody>
                  ${dayRows}
                </tbody>
              </table>
            </div>
          </div>
        `;
          })
          .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #111827; max-width: 960px; margin: 0 auto; padding: 24px; background:#f3f4f6; }
    .header { background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%); color: white; padding: 26px; border-radius: 12px; margin-bottom: 24px; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 6px 0 0 0; opacity: 0.95; }
    .section { background: white; border-radius: 10px; border: 1px solid #e5e7eb; padding: 20px; margin-bottom: 20px; }
    .section-title { font-size: 18px; font-weight: 600; margin-bottom: 8px; color: #111827; }
    .section-sub { font-size: 13px; color: #6b7280; margin-bottom: 12px; }
    .agent-block { border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 16px; }
    .agent-block h2 { font-size: 17px; margin: 0 0 8px 0; }
    .sub-section { margin-top: 10px; }
    .sub-title { font-size: 14px; font-weight: 600; margin-bottom: 6px; color:#374151; }
    table { width: 100%; border-collapse: collapse; margin-top: 4px; }
    th { background:#f9fafb; padding: 8px 10px; font-size: 12px; text-align:left; border-bottom:1px solid #e5e7eb; color:#4b5563; }
    td { padding: 7px 10px; font-size: 12px; border-bottom:1px solid #f3f4f6; vertical-align: top; }
    tr:last-child td { border-bottom:none; }
    .badge { display:inline-block; padding:2px 8px; border-radius:999px; font-size:11px; font-weight:600; }
    .badge-info { background:#dbeafe; color:#1d4ed8; }
    .badge-warning { background:#fef3c7; color:#92400e; }
    .footer { text-align:center; font-size:12px; color:#9ca3af; margin-top:20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🗓️ Plan d'Actions Hebdomadaire</h1>
    <p>Gadait International CRM – Semaine du ${dateRange}</p>
  </div>

  <div class="section">
    <div class="section-title">Objectif</div>
    <div class="section-sub">
      Synthèse des actions <strong>à rattraper</strong> et des actions <strong>programmées</strong> par agent
      pour les 7 prochains jours : calls, relances, visites, estimations, propositions, compromis, actes de vente et contrats de location.
    </div>
  </div>

  <div class="section">
    ${agentBlocks}
  </div>

  <div class="footer">
    Rapport généré automatiquement par Gadait CRM – Planification hebdomadaire
  </div>
</body>
</html>
  `;
}

// ---- HANDLER ----

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  }

  try {
    console.log("🚀 Generating weekly planning report...");

    const summaries = await getWeeklyPlanningByAgent();
    const html = buildPlanningHtml(summaries);

    const { data, error } = await resend.emails.send({
      from: RESEND_FROM,
      to: MANAGER_RECIPIENTS,
      subject: "🗓️ Plan d'Actions – Semaine à venir (Gadait CRM)",
      html,
    });

    if (error) {
      console.error("❌ Error sending weekly planning report:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send weekly planning report", details: error }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        },
      );
    }

    console.log("✅ Weekly planning report sent:", data);

    return new Response(
      JSON.stringify({ success: true, message: "Weekly planning report sent", data }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      },
    );
  } catch (err: unknown) {
    console.error("❌ Error in weekly-planning-report:", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      },
    );
  }
};

serve(handler);
