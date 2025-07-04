import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const resend = new Resend(RESEND_API_KEY);

// Interface pour les données de lead enrichies
interface EnrichedLead {
  id: string;
  name: string;
  email: string;
  salutation?: string;
  location?: string;
  country?: string;
  budget?: string;
  currency?: string;
  property_types?: string[];
  nationality?: string;
  preferred_language?: string;
  assigned_to?: string;
  tags?: string[];
  status: string;
  last_contacted_at?: string;
  created_at: string;
}

// Interface pour les campagnes
interface EmailCampaign {
  id: string;
  name: string;
  trigger_days: number[];
  target_segments: string[];
  min_budget: number;
  is_active: boolean;
}

// Template React Email Loro Piana
const LoroEmailTemplate = ({ 
  leadName, 
  leadSalutation,
  subject, 
  content, 
  agentName = "Gadait International",
  agentSignature = "L'équipe Gadait International"
}: {
  leadName: string;
  leadSalutation?: string;
  subject: string;
  content: string;
  agentName?: string;
  agentSignature?: string;
}) => {
  return React.createElement('html', {},
    React.createElement('head', {},
      React.createElement('meta', { charSet: 'utf-8' }),
      React.createElement('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
      React.createElement('style', {}, `
        body { 
          font-family: 'Optima', 'Helvetica Neue', Arial, sans-serif; 
          line-height: 1.6; 
          color: #2C3E50; 
          background-color: #FEFEFE;
          margin: 0;
          padding: 0;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: #FFFFFF;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .header { 
          background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); 
          color: #FFFFFF; 
          padding: 40px 30px; 
          text-align: center;
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px; 
          font-weight: 300; 
          letter-spacing: 2px;
        }
        .content { 
          padding: 40px 30px; 
        }
        .greeting { 
          font-size: 18px; 
          margin-bottom: 30px; 
          color: #2C3E50;
        }
        .main-content { 
          margin-bottom: 30px; 
          color: #34495E;
          line-height: 1.8;
        }
        .signature { 
          margin-top: 40px; 
          padding-top: 25px; 
          border-top: 1px solid #E5E5E5; 
          color: #7F8C8D;
        }
        .footer { 
          background-color: #F8F9FA; 
          padding: 30px; 
          text-align: center; 
          color: #95A5A6; 
          font-size: 12px;
        }
        .cta-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); 
          color: #FFFFFF; 
          padding: 15px 30px; 
          text-decoration: none; 
          border-radius: 6px; 
          margin: 20px 0; 
          font-weight: 500;
        }
      `)
    ),
    React.createElement('body', {},
      React.createElement('div', { className: 'container' },
        React.createElement('div', { className: 'header' },
          React.createElement('h1', {}, 'GADAIT INTERNATIONAL')
        ),
        React.createElement('div', { className: 'content' },
          React.createElement('div', { className: 'greeting' },
            `${leadSalutation || 'Cher/Chère'} ${leadName},`
          ),
          React.createElement('div', { 
            className: 'main-content',
            dangerouslySetInnerHTML: { __html: content }
          }),
          React.createElement('div', { className: 'signature' },
            React.createElement('p', {}, `Cordialement,`),
            React.createElement('p', {}, agentSignature),
            React.createElement('p', {}, `📞 +230 268 2828`),
            React.createElement('p', {}, `✉️ contact@gadait.com`)
          )
        ),
        React.createElement('div', { className: 'footer' },
          React.createElement('p', {}, `Gadait International - Immobilier de prestige`),
          React.createElement('p', {}, `Si vous ne souhaitez plus recevoir nos communications, `)
        )
      )
    )
  );
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Automated email system triggered');
    
    const { action = 'process_sequences' } = await req.json().catch(() => ({}));
    
    if (action === 'process_sequences') {
      return await processEmailSequences();
    } else if (action === 'stop_sequence') {
      const { leadId, reason = 'manual' } = await req.json();
      return await stopSequence(leadId, reason);
    } else if (action === 'start_sequence') {
      const { leadId, campaignId, immediateStart } = await req.json();
      return await startSequence(leadId, campaignId, immediateStart);
    }
    
    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
    
  } catch (error) {
    console.error('Error in automated email system:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

async function processEmailSequences() {
  console.log('Processing email sequences...');
  
  // 1. Identifier les leads éligibles pour démarrer une séquence
  const eligibleLeads = await findEligibleLeads();
  console.log(`Found ${eligibleLeads.length} eligible leads for new sequences`);
  
  // 2. Démarrer les nouvelles séquences
  for (const lead of eligibleLeads) {
    await startSequence(lead.id, await getDefaultCampaignId());
  }
  
  // 3. Traiter les emails en attente d'envoi
  const pendingEmails = await findPendingEmails();
  console.log(`Found ${pendingEmails.length} pending emails to send`);
  
  let sentCount = 0;
  for (const emailData of pendingEmails) {
    try {
      await sendScheduledEmail(emailData);
      sentCount++;
    } catch (error) {
      console.error(`Failed to send email to ${emailData.lead_email}:`, error);
    }
  }
  
  return new Response(JSON.stringify({ 
    success: true,
    newSequences: eligibleLeads.length,
    emailsSent: sentCount,
    message: `Processed ${eligibleLeads.length} new sequences and sent ${sentCount} emails`
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

async function findEligibleLeads(): Promise<EnrichedLead[]> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  
  // Chercher les leads sans réponse depuis 7 jours et pas déjà en séquence
  const { data: leads, error } = await supabase
    .from('leads')
    .select(`
      id, name, email, salutation, location, country, budget, currency,
      property_types, nationality, preferred_language, assigned_to, tags, status,
      last_contacted_at, created_at
    `)
    .eq('status', 'No response')
    .not('email', 'is', null)
    .lt('last_contacted_at', sevenDaysAgo)
    .not('id', 'in', `(
      SELECT lead_id FROM lead_email_sequences 
      WHERE is_active = true
    )`);
    
  if (error) {
    console.error('Error finding eligible leads:', error);
    return [];
  }
  
  // Filtrer par budget minimum (500k EUR)
  return (leads || []).filter(lead => {
    const budget = parseInt(lead.budget?.replace(/[^\d]/g, '') || '0');
    return budget >= 500000;
  });
}

async function findPendingEmails() {
  const now = new Date().toISOString();
  
  const { data: sequences, error } = await supabase
    .from('lead_email_sequences')
    .select(`
      id, lead_id, campaign_id, next_email_date, next_email_day,
      leads (
        id, name, email, salutation, location, country, budget, currency,
        property_types, nationality, preferred_language, assigned_to, tags
      )
    `)
    .eq('is_active', true)
    .not('next_email_date', 'is', null)
    .lte('next_email_date', now);
    
  if (error) {
    console.error('Error finding pending emails:', error);
    return [];
  }
  
  return sequences || [];
}

async function startSequence(leadId: string, campaignId: string, immediateStart: boolean = false) {
  console.log(`Starting sequence for lead ${leadId} with campaign ${campaignId}`);
  
  // Calculer la date du premier email (immédiat ou J+7)
  const firstEmailDate = immediateStart ? new Date() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  const { error } = await supabase
    .from('lead_email_sequences')
    .insert({
      lead_id: leadId,
      campaign_id: campaignId,
      next_email_date: firstEmailDate.toISOString(),
      next_email_day: 7,
      last_activity_date: new Date().toISOString(),
      last_activity_type: 'sequence_started'
    });
    
  if (error) {
    console.error(`Error starting sequence for lead ${leadId}:`, error);
    throw error;
  }
  
  // Ajouter une action dans l'historique du lead
  await addActionToLead(leadId, 'Email Auto J+7', firstEmailDate.toISOString(), 'Séquence d\'emails automatiques démarrée');
}

async function stopSequence(leadId: string, reason: string) {
  console.log(`Stopping sequence for lead ${leadId}, reason: ${reason}`);
  
  const { error } = await supabase
    .from('lead_email_sequences')
    .update({
      is_active: false,
      stopped_at: new Date().toISOString(),
      stopped_reason: reason,
      next_email_date: null,
      next_email_day: null
    })
    .eq('lead_id', leadId)
    .eq('is_active', true);
    
  if (error) {
    console.error(`Error stopping sequence for lead ${leadId}:`, error);
    throw error;
  }
  
  return new Response(JSON.stringify({ 
    success: true,
    message: `Sequence stopped for lead ${leadId}`
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

async function sendScheduledEmail(emailData: any) {
  const lead = emailData.leads;
  console.log(`Sending scheduled email to ${lead.email} (Day ${emailData.next_email_day})`);
  
  // Récupérer le template pour ce jour
  const { data: template, error: templateError } = await supabase
    .from('email_templates')
    .select('*')
    .eq('campaign_id', emailData.campaign_id)
    .eq('day_number', emailData.next_email_day)
    .single();
    
  if (templateError || !template) {
    console.error('Template not found:', templateError);
    return;
  }
  
  // Générer le contenu personnalisé avec l'IA
  const personalizedContent = await generatePersonalizedContent(lead, template);
  const personalizedSubject = personalizeTemplate(template.subject_template, lead);
  
  // Générer l'ID d'action unique
  const actionId = `auto_email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Render l'email avec React Email
  const emailHtml = await renderAsync(
    React.createElement(LoroEmailTemplate, {
      leadName: lead.name,
      leadSalutation: lead.salutation,
      subject: personalizedSubject,
      content: personalizedContent,
      agentName: "Gadait International",
      agentSignature: "L'équipe Gadait International"
    })
  );
  
  // Envoyer l'email via Resend
  const { data: emailResult, error: emailError } = await resend.emails.send({
    from: 'Gadait International <contact@gadait.com>',
    to: [lead.email],
    subject: personalizedSubject,
    html: emailHtml,
  });
  
  if (emailError) {
    console.error('Failed to send email:', emailError);
    throw emailError;
  }
  
  // Logger l'envoi
  await supabase
    .from('automated_email_logs')
    .insert({
      lead_id: lead.id,
      campaign_id: emailData.campaign_id,
      template_id: template.id,
      action_id: actionId,
      recipient_email: lead.email,
      subject: personalizedSubject,
      content_html: emailHtml,
      personalization_data: { lead_data: lead },
      ai_generated_content: { content: personalizedContent }
    });
  
  // Ajouter l'action à l'historique du lead
  await addActionToLead(
    lead.id, 
    `Email Auto J+${emailData.next_email_day}`, 
    new Date().toISOString(),
    `Email automatique envoyé: ${personalizedSubject}`,
    actionId
  );
  
  // Programmer le prochain email ou terminer la séquence
  const nextDay = getNextEmailDay(emailData.next_email_day);
  if (nextDay) {
    const nextDate = new Date(Date.now() + (nextDay - emailData.next_email_day) * 24 * 60 * 60 * 1000);
    
    await supabase
      .from('lead_email_sequences')
      .update({
        next_email_date: nextDate.toISOString(),
        next_email_day: nextDay
      })
      .eq('id', emailData.id);
      
    // Ajouter la prochaine action programmée
    await addActionToLead(
      lead.id,
      `Email Auto J+${nextDay}`,
      nextDate.toISOString(),
      'Email automatique programmé'
    );
  } else {
    // Terminer la séquence
    await supabase
      .from('lead_email_sequences')
      .update({
        is_active: false,
        next_email_date: null,
        next_email_day: null,
        stopped_reason: 'completed'
      })
      .eq('id', emailData.id);
  }
}

async function generatePersonalizedContent(lead: any, template: any): Promise<string> {
  const prompt = `
Tu es un expert en immobilier de luxe pour Gadait International. 
Génère un contenu d'email personnalisé et élégant pour ce lead:

Profil du lead:
- Nom: ${lead.name}
- Localisation recherchée: ${lead.location || 'Non spécifié'}
- Pays: ${lead.country || 'Non spécifié'}
- Budget: ${lead.budget || 'Non spécifié'} ${lead.currency || 'EUR'}
- Types de propriétés: ${lead.property_types?.join(', ') || 'Non spécifié'}
- Nationalité: ${lead.nationality || 'Non spécifié'}

Template de base: ${template.content_template}
Jour de la séquence: J+${template.day_number}

Règles:
1. Ton professionnel mais chaleureux, style Loro Piana
2. Personnalisation subtile basée sur le profil
3. Maximum 200 mots
4. Inclure un appel à l'action approprié
5. Utiliser des informations de marché pertinentes
6. Format HTML simple (p, br, strong uniquement)

Génère UNIQUEMENT le contenu HTML personnalisé, sans les formules de politesse (déjà gérées par le template).
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Tu es un expert en communication immobilière de luxe.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI content:', error);
    // Fallback vers un contenu par défaut
    return `<p>Nous espérons que vous allez bien et que votre projet immobilier avance selon vos souhaits.</p>
            <p>Nous avons sélectionné de nouvelles opportunités qui pourraient correspondre à vos critères de recherche${lead.location ? ` sur ${lead.location}` : ''}.</p>
            <p>N'hésitez pas à nous contacter pour échanger sur ces biens d'exception.</p>`;
  }
}

function personalizeTemplate(template: string, lead: any): string {
  return template
    .replace(/\{\{nom\}\}/g, lead.name)
    .replace(/\{\{location\}\}/g, lead.location || lead.country || 'votre région')
    .replace(/\{\{budget\}\}/g, lead.budget || 'votre budget')
    .replace(/\{\{month\}\}/g, new Date().toLocaleDateString('fr-FR', { month: 'long' }))
    .replace(/\{\{year\}\}/g, new Date().getFullYear().toString());
}

function getNextEmailDay(currentDay: number): number | null {
  const sequence = [7, 14, 21, 30];
  const currentIndex = sequence.indexOf(currentDay);
  return currentIndex !== -1 && currentIndex < sequence.length - 1 
    ? sequence[currentIndex + 1] 
    : null;
}

async function addActionToLead(
  leadId: string, 
  actionType: string, 
  scheduledDate: string, 
  notes: string,
  actionId?: string
) {
  // Récupérer l'historique actuel
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('action_history')
    .eq('id', leadId)
    .single();
    
  if (leadError || !lead) {
    console.error('Error fetching lead for action history:', leadError);
    return;
  }
  
  const currentHistory = lead.action_history || [];
  const newAction = {
    id: actionId || `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    actionType,
    createdAt: new Date().toISOString(),
    scheduledDate,
    notes,
    isAutomated: true
  };
  
  const updatedHistory = [...currentHistory, newAction];
  
  // Mettre à jour l'historique
  const { error: updateError } = await supabase
    .from('leads')
    .update({ action_history: updatedHistory })
    .eq('id', leadId);
    
  if (updateError) {
    console.error('Error updating action history:', updateError);
  }
}

async function getDefaultCampaignId(): Promise<string> {
  const { data: campaign, error } = await supabase
    .from('automated_email_campaigns')
    .select('id')
    .eq('name', 'Séquence de Réactivation Premium')
    .eq('is_active', true)
    .single();
    
  if (error || !campaign) {
    throw new Error('Default campaign not found');
  }
  
  return campaign.id;
}