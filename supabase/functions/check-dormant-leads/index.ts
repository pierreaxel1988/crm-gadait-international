import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_EMAILS = [
  'pierre@gadait-international.com',
  'christelle@gadait-international.com',
];

const HOT_STATUSES = ['Visit', 'Offre', 'Deposit'];
const DORMANT_DAYS = 7;

// ── Helpers to parse action_history (mirrors HotPipelineMonitor logic) ──

interface ActionEntry {
  actionType?: string;
  createdAt?: string;
  scheduledDate?: string;
  completedDate?: string;
}

function parseDate(v: unknown): Date | null {
  if (!v || typeof v !== 'string') return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function analyseActions(actionHistory: unknown[]) {
  const now = new Date();
  let lastActionDate: Date | null = null;
  let lastActionType: string | null = null;
  let nextPlannedDate: Date | null = null;
  let nextPlannedType: string | null = null;

  for (const raw of actionHistory) {
    const a = raw as ActionEntry;
    if (!a) continue;

    // Skip "Creation" entries – not real actions
    if (a.actionType === 'Creation') continue;

    // Determine the effective date for this action
    const completed = parseDate(a.completedDate);
    const scheduled = parseDate(a.scheduledDate);
    const created = parseDate(a.createdAt);

    // If action has a future scheduled date and is NOT completed → planned
    if (scheduled && scheduled > now && !completed) {
      if (!nextPlannedDate || scheduled < nextPlannedDate) {
        nextPlannedDate = scheduled;
        nextPlannedType = a.actionType || 'Action';
      }
      continue;
    }

    // Otherwise it's a past action – find the most recent one
    const effectiveDate = completed || scheduled || created;
    if (effectiveDate && (!lastActionDate || effectiveDate > lastActionDate)) {
      lastActionDate = effectiveDate;
      lastActionType = a.actionType || 'Action';
    }
  }

  return { lastActionDate, lastActionType, nextPlannedDate, nextPlannedType };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'noreply@gadait-international.com';

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 Starting dormant leads check...');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - DORMANT_DAYS);

    // Fetch hot leads with the REAL activity columns
    const { data: hotLeads, error: leadsError } = await supabase
      .from('leads')
      .select('id, name, email, status, assigned_to, action_history, last_contacted_at, next_follow_up_date, pipeline_type, created_at')
      .in('status', HOT_STATUSES)
      .is('deleted_at', null);

    if (leadsError) {
      console.error('Error fetching leads:', leadsError);
      throw leadsError;
    }

    console.log(`Found ${hotLeads?.length || 0} leads in hot statuses`);

    // Fetch team members for names/emails
    const { data: teamMembers } = await supabase
      .from('team_members')
      .select('id, name, email');

    const teamMap = new Map((teamMembers || []).map(tm => [tm.id, tm]));

    // Identify dormant leads using action_history analysis
    const dormantLeads: {
      lead: typeof hotLeads extends (infer T)[] ? T : never;
      daysSince: number;
      lastActionType: string;
      lastActionDateStr: string;
    }[] = [];

    for (const lead of hotLeads || []) {
      const history = Array.isArray(lead.action_history) ? lead.action_history : [];
      const { lastActionDate, lastActionType, nextPlannedDate } = analyseActions(history);

      // If there's a future action planned → not dormant
      if (nextPlannedDate) continue;

      // Also check next_follow_up_date as a secondary signal
      if (lead.next_follow_up_date) {
        const nfud = parseDate(lead.next_follow_up_date);
        if (nfud && nfud > new Date()) continue;
      }

      // Determine last activity: action_history > last_contacted_at > created_at
      const lastActivity = lastActionDate
        || parseDate(lead.last_contacted_at)
        || parseDate(lead.created_at)
        || new Date(0);

      if (lastActivity >= cutoffDate) continue; // Active recently

      const daysSince = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

      dormantLeads.push({
        lead,
        daysSince,
        lastActionType: lastActionType || 'Aucune',
        lastActionDateStr: lastActivity.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
      });
    }

    console.log(`Found ${dormantLeads.length} dormant leads`);

    let notificationsCreated = 0;
    let emailsSent = 0;
    const emailAlerts: {
      leadName: string;
      status: string;
      agentName: string;
      daysSince: number;
      leadId: string;
      lastActionType: string;
      lastActionDateStr: string;
    }[] = [];

    for (const { lead, daysSince, lastActionType, lastActionDateStr } of dormantLeads) {
      const agent = lead.assigned_to ? teamMap.get(lead.assigned_to) : null;

      // Avoid duplicate notifications (within 3 days)
      if (lead.assigned_to) {
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('lead_id', lead.id)
          .eq('type', 'dormant_lead')
          .gte('created_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())
          .maybeSingle();

        if (existing) {
          console.log(`⏭️ Notification already exists for lead ${lead.name}`);
          emailAlerts.push({
            leadName: lead.name,
            status: lead.status,
            agentName: agent?.name || 'Non assigné',
            daysSince,
            leadId: lead.id,
            lastActionType,
            lastActionDateStr,
          });
          continue;
        }

        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: lead.assigned_to,
            lead_id: lead.id,
            type: 'dormant_lead',
            title: `🚨 Lead dormant : ${lead.name}`,
            message: `Le lead "${lead.name}" (${lead.status}) n'a eu aucune action depuis ${daysSince} jours (dernière : ${lastActionType} le ${lastActionDateStr}). Relancez-le rapidement !`,
            metadata: {
              days_inactive: daysSince,
              lead_status: lead.status,
              agent_name: agent?.name || 'Non assigné',
              last_action_type: lastActionType,
              last_action_date: lastActionDateStr,
            }
          });

        if (notifError) {
          console.error(`Error creating notification for ${lead.name}:`, notifError);
        } else {
          notificationsCreated++;
        }
      }

      emailAlerts.push({
        leadName: lead.name,
        status: lead.status,
        agentName: agent?.name || 'Non assigné',
        daysSince,
        leadId: lead.id,
        lastActionType,
        lastActionDateStr,
      });
    }

    // ── Send emails ──
    if (emailAlerts.length > 0 && resendApiKey) {
      const crmBaseUrl = 'https://crm-gadait-international.lovable.app';

      const alertsByAgent = new Map<string, typeof emailAlerts>();
      for (const alert of emailAlerts) {
        const key = alert.agentName;
        if (!alertsByAgent.has(key)) alertsByAgent.set(key, []);
        alertsByAgent.get(key)!.push(alert);
      }

      const buildLeadsTableHtml = (alerts: typeof emailAlerts) => {
        const rows = alerts.map(a => `
          <tr>
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">
              <a href="${crmBaseUrl}/leads/${a.leadId}" style="color:#b45309;font-weight:600;text-decoration:none;">${a.leadName}</a>
            </td>
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">
              <span style="background:${a.status === 'Deposit' ? '#fef3c7' : a.status === 'Offre' ? '#dbeafe' : '#e0e7ff'};color:#1e3a5f;padding:3px 10px;border-radius:12px;font-size:13px;">${a.status}</span>
            </td>
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">${a.agentName}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:13px;">${a.lastActionType}<br><span style="color:#6b7280;font-size:12px;">${a.lastActionDateStr}</span></td>
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#dc2626;font-weight:600;">${a.daysSince} jours</td>
          </tr>
        `).join('');

        return `
          <table style="width:100%;border-collapse:collapse;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;">
            <thead>
              <tr style="background:#f8f9fa;">
                <th style="padding:10px 14px;text-align:left;border-bottom:2px solid #d1d5db;color:#374151;">Lead</th>
                <th style="padding:10px 14px;text-align:left;border-bottom:2px solid #d1d5db;color:#374151;">Stade</th>
                <th style="padding:10px 14px;text-align:left;border-bottom:2px solid #d1d5db;color:#374151;">Agent</th>
                <th style="padding:10px 14px;text-align:left;border-bottom:2px solid #d1d5db;color:#374151;">Dernière action</th>
                <th style="padding:10px 14px;text-align:left;border-bottom:2px solid #d1d5db;color:#374151;">Inactif depuis</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        `;
      };

      // Send individual email to each agent
      for (const [agentName, alerts] of alertsByAgent.entries()) {
        const agentMember = (teamMembers || []).find(tm => tm.name === agentName);
        if (!agentMember?.email) continue;

        const agentHtml = `
          <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:700px;margin:0 auto;padding:20px;">
            <div style="background:#1e3a5f;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
              <h1 style="color:#c9a96e;margin:0;font-size:22px;">🚨 Leads Dormants — Action requise</h1>
            </div>
            <div style="background:#ffffff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
              <p style="color:#374151;font-size:15px;">Bonjour ${agentName},</p>
              <p style="color:#374151;font-size:15px;">Les leads suivants en phase avancée n'ont eu <strong>aucune action depuis ${DORMANT_DAYS}+ jours</strong>. Chaque jour d'inactivité augmente le risque de perdre ces opportunités.</p>
              ${buildLeadsTableHtml(alerts)}
              <div style="text-align:center;margin-top:24px;">
                <a href="${crmBaseUrl}/my-day" style="display:inline-block;background:#b45309;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">Voir Ma Journée</a>
              </div>
            </div>
            <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:16px;">GADAIT International CRM — Alerte automatique</p>
          </div>
        `;

        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
            body: JSON.stringify({
              from: fromEmail,
              to: [agentMember.email],
              subject: `🚨 ${alerts.length} lead(s) dormant(s) nécessitent votre attention`,
              html: agentHtml,
            }),
          });
          if (res.ok) {
            emailsSent++;
            console.log(`✉️ Email sent to agent ${agentName} (${agentMember.email})`);
          } else {
            console.error(`Failed to send email to ${agentMember.email}:`, await res.text());
          }
        } catch (e) {
          console.error(`Email error for ${agentMember.email}:`, e);
        }
      }

      // Send summary email to admins
      const adminHtml = `
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:700px;margin:0 auto;padding:20px;">
          <div style="background:#1e3a5f;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
            <h1 style="color:#c9a96e;margin:0;font-size:22px;">🚨 Rapport Leads Dormants</h1>
            <p style="color:#ffffff;margin:8px 0 0;font-size:14px;">${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div style="background:#ffffff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
            <div style="display:flex;gap:16px;margin-bottom:20px;">
              <div style="flex:1;background:#fef2f2;padding:16px;border-radius:8px;text-align:center;">
                <div style="font-size:28px;font-weight:700;color:#dc2626;">${emailAlerts.length}</div>
                <div style="font-size:13px;color:#6b7280;">Leads dormants</div>
              </div>
              <div style="flex:1;background:#fefce8;padding:16px;border-radius:8px;text-align:center;">
                <div style="font-size:28px;font-weight:700;color:#b45309;">${alertsByAgent.size}</div>
                <div style="font-size:13px;color:#6b7280;">Agents concernés</div>
              </div>
            </div>
            <h3 style="color:#1e3a5f;margin-bottom:12px;">Détail par lead :</h3>
            ${buildLeadsTableHtml(emailAlerts)}
            <div style="text-align:center;margin-top:24px;">
              <a href="${crmBaseUrl}/hot-pipeline" style="display:inline-block;background:#1e3a5f;color:#c9a96e;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">Pipeline Chaud</a>
            </div>
          </div>
          <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:16px;">GADAIT International CRM — Rapport quotidien automatique</p>
        </div>
      `;

      for (const adminEmail of ADMIN_EMAILS) {
        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
            body: JSON.stringify({
              from: fromEmail,
              to: [adminEmail],
              subject: `🚨 Rapport : ${emailAlerts.length} lead(s) dormant(s) détecté(s)`,
              html: adminHtml,
            }),
          });
          if (res.ok) {
            emailsSent++;
            console.log(`✉️ Admin email sent to ${adminEmail}`);
          } else {
            console.error(`Failed to send admin email to ${adminEmail}:`, await res.text());
          }
        } catch (e) {
          console.error(`Admin email error for ${adminEmail}:`, e);
        }
      }
    } else if (emailAlerts.length > 0 && !resendApiKey) {
      console.warn('⚠️ RESEND_API_KEY not configured — skipping email sending');
    }

    const result = {
      success: true,
      hot_leads_checked: hotLeads?.length || 0,
      dormant_found: dormantLeads.length,
      notifications_created: notificationsCreated,
      emails_sent: emailsSent,
      timestamp: new Date().toISOString(),
    };

    console.log('✅ Dormant leads check completed:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in check-dormant-leads:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
