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
  views?: string;
  amenities?: string;
  purchase_timeframe?: string;
  financing_method?: string;
  tax_residence?: string;
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

// Interface pour les propriétés suggérées
interface SuggestedProperty {
  id: string;
  reference: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  surface: number;
  images: string[];
  location: string;
  country: string;
}

// Fonction pour générer les URLs de propriétés avec slugs
function generatePropertyUrl(property: SuggestedProperty, language: string, leadId?: string): string {
  const baseUrl = 'https://gadait-international.com';
  const langPrefix = language === 'FR' ? 'fr' : (language === 'ES' ? 'es' : 'en');
  const propertyUrl = `${baseUrl}/${langPrefix}/${property.slug}`;
  
  // Ajouter le tracking via l'edge function track-property-click
  if (leadId) {
    const trackingUrl = `${SUPABASE_URL}/functions/v1/track-property-click?lead_id=${leadId}&property_id=${property.id}&redirect_url=${encodeURIComponent(propertyUrl)}`;
    return trackingUrl;
  }
  
  return propertyUrl;
}

// Composant PropertyCard pour React Email
const PropertyCard = ({ 
  property, 
  language, 
  leadId 
}: { 
  property: SuggestedProperty; 
  language: string; 
  leadId?: string;
}) => {
  const propertyUrl = generatePropertyUrl(property, language, leadId);
  const mainImage = property.images?.[0] || '';
  const labels = {
    FR: { bedrooms: 'chambres', bathrooms: 'salles de bain', surface: 'm²', discover: '✨ Découvrir cette propriété' },
    EN: { bedrooms: 'bedrooms', bathrooms: 'bathrooms', surface: 'm²', discover: '✨ Discover this property' },
    ES: { bedrooms: 'habitaciones', bathrooms: 'baños', surface: 'm²', discover: '✨ Descubrir esta propiedad' }
  };
  const label = labels[language] || labels.EN;
  
  return React.createElement('div', { className: 'property-card', style: { margin: '20px 0', border: '1px solid #E5E5E5', borderRadius: '8px', overflow: 'hidden', background: '#FFFFFF' } },
    mainImage && React.createElement('a', { href: propertyUrl, style: { display: 'block', textDecoration: 'none' } },
      React.createElement('img', { 
        src: mainImage, 
        alt: property.title,
        style: { width: '100%', height: '250px', objectFit: 'cover', display: 'block' }
      })
    ),
    React.createElement('div', { style: { padding: '20px' } },
      React.createElement('h3', { style: { margin: '0 0 10px 0', fontSize: '18px', color: '#2C3E50', fontWeight: '500' } }, 
        property.title
      ),
      React.createElement('p', { style: { margin: '0 0 15px 0', fontSize: '14px', color: '#7F8C8D' } },
        `📍 ${property.location}, ${property.country}`
      ),
      React.createElement('div', { style: { display: 'flex', gap: '15px', margin: '15px 0', fontSize: '14px', color: '#34495E' } },
        React.createElement('span', {}, `🛏️ ${property.bedrooms} ${label.bedrooms}`),
        React.createElement('span', {}, `🚿 ${property.bathrooms} ${label.bathrooms}`),
        React.createElement('span', {}, `📐 ${property.surface} ${label.surface}`)
      ),
      React.createElement('div', { style: { margin: '15px 0' } },
        React.createElement('p', { style: { margin: '0', fontSize: '22px', fontWeight: '600', color: '#8B4513' } },
          `${property.price.toLocaleString()} ${property.currency}`
        )
      ),
      React.createElement('a', { 
        href: propertyUrl,
        className: 'cta-button',
        style: { display: 'inline-block', background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)', color: '#FFFFFF', padding: '12px 24px', textDecoration: 'none', borderRadius: '6px', fontWeight: '500', marginTop: '10px' }
      }, label.discover)
    )
  );
};

// Template React Email Loro Piana
const LoroEmailTemplate = ({ 
  leadName, 
  leadSalutation,
  subject, 
  content, 
  properties = [],
  language = 'FR',
  leadId,
  agentName = "Gadait International",
  agentSignature = "L'équipe Gadait International"
}: {
  leadName: string;
  leadSalutation?: string;
  subject: string;
  content: string;
  properties?: SuggestedProperty[];
  language?: string;
  leadId?: string;
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
        .properties-section {
          margin: 40px 0;
          padding: 30px 0;
          border-top: 2px solid #E5E5E5;
        }
        .properties-title {
          font-size: 20px;
          font-weight: 500;
          color: #2C3E50;
          margin-bottom: 20px;
          text-align: center;
        }
        .property-card {
          margin: 20px 0;
          border: 1px solid #E5E5E5;
          border-radius: 8px;
          overflow: hidden;
          background: #FFFFFF;
        }
      `)
    ),
    React.createElement('body', {},
      React.createElement('div', { className: 'container' },
        React.createElement('div', { className: 'header' },
          React.createElement('img', { 
            src: 'https://www.gadait-international.com/static/media/logo.c86ab9e0598ca0f55b0db0ab4a7c6256.svg',
            alt: 'Gadait International',
            style: { height: '50px', width: 'auto' }
          })
        ),
        React.createElement('div', { className: 'content' },
          React.createElement('div', { className: 'greeting' },
            `${leadSalutation || 'Cher/Chère'} ${leadName},`
          ),
          React.createElement('div', { 
            className: 'main-content',
            dangerouslySetInnerHTML: { __html: content }
          }),
          properties.length > 0 && React.createElement('div', { className: 'properties-section' },
            React.createElement('h2', { className: 'properties-title' }, 
              language === 'FR' ? '🏡 Nos propriétés sélectionnées pour vous' : 
              language === 'ES' ? '🏡 Nuestras propiedades seleccionadas para usted' : 
              '🏡 Our selected properties for you'
            ),
            ...properties.map(property => PropertyCard({ property, language, leadId }))
          ),
          React.createElement('div', { className: 'signature' },
            React.createElement('p', {}, `Cordialement,`),
            React.createElement('p', {}, agentSignature),
            React.createElement('p', {}, `📞 +230 268 2828`),
            React.createElement('p', {}, `✉️ contact@gadait-international.com`)
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
    
    const body = await req.json().catch(() => ({}));
    console.log('[DEBUG] Request body:', JSON.stringify(body));
    const { action = 'process_sequences', leadId, lead_id, reason, campaignId, immediateStart, templateDay, template_day, targetEmail, leadData } = body;
    const finalLeadId = leadId || lead_id;
    const finalTemplateDay = templateDay || template_day;
    console.log('[DEBUG] finalLeadId:', finalLeadId, 'finalTemplateDay:', finalTemplateDay);
    
    if (action === 'process_sequences') {
      return await processEmailSequences();
    } else if (action === 'stop_sequence') {
      return await stopSequence(finalLeadId, reason || 'manual');
    } else if (action === 'start_sequence') {
      return await startSequence(finalLeadId, campaignId, immediateStart);
    } else if (action === 'send_test_email') {
      return await sendTestEmailWithRealLead(finalLeadId, finalTemplateDay || 3);
    } else if (action === 'send_preview_emails') {
      return await sendPreviewEmails(targetEmail, leadData);
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
  // MODE TEST : Cibler uniquement les leads "Serious + No response"
  console.log('[TEST PILOT] Finding eligible leads: Serious + No response');
  
  // ÉTAPE 1 : Récupérer les leads qui ont déjà une séquence active
  const { data: activeSequences, error: seqError } = await supabase
    .from('lead_email_sequences')
    .select('lead_id')
    .eq('is_active', true);
    
  if (seqError) {
    console.error('[TEST PILOT] Error fetching active sequences:', seqError);
    return [];
  }
  
  const excludedLeadIds = activeSequences?.map(s => s.lead_id) || [];
  console.log(`[TEST PILOT] Excluding ${excludedLeadIds.length} leads with active sequences`);
  
  // ÉTAPE 2 : Récupérer les leads "Serious + No response"
  const { data: leads, error } = await supabase
    .from('leads')
    .select(`
      id, name, email, salutation, location, country, budget, currency,
      property_types, nationality, preferred_language, assigned_to, tags, status,
      last_contacted_at, created_at, views, amenities, purchase_timeframe, 
      financing_method, tax_residence
    `)
    .contains('tags', ['Serious'])
    .contains('tags', ['No response'])
    .not('email', 'is', null);
    
  if (error) {
    console.error('[TEST PILOT] Error finding eligible leads:', error);
    return [];
  }
  
  // Filtrer manuellement pour exclure les leads avec séquence active
  const filteredLeads = (leads || []).filter(lead => 
    !excludedLeadIds.includes(lead.id)
  );
  
  // Filtrer par budget minimum (400k EUR pour le test pilote)
  const eligibleLeads = filteredLeads.filter(lead => {
    const budget = parseInt(lead.budget?.replace(/[^\d]/g, '') || '0');
    return budget >= 400000;
  });
  
  console.log(`[TEST PILOT] Found ${eligibleLeads.length} eligible leads for test`);
  return eligibleLeads;
}

async function findPendingEmails() {
  const now = new Date().toISOString();
  
  const { data: sequences, error } = await supabase
    .from('lead_email_sequences')
    .select(`
      id, lead_id, campaign_id, next_email_date, next_email_day,
      leads (
        id, name, email, salutation, location, country, budget, currency,
        property_types, nationality, preferred_language, assigned_to, tags,
        views, amenities, purchase_timeframe, financing_method, tax_residence
      )
    `)
    .eq('is_active', true)
    .not('next_email_date', 'is', null)
    .lte('next_email_date', now);
    
  if (error) {
    console.error('[TEST PILOT] Error finding pending emails:', error);
    return [];
  }
  
  console.log(`[TEST PILOT] Found ${sequences?.length || 0} pending emails`);
  return sequences || [];
}

async function startSequence(leadId: string, campaignId: string, immediateStart: boolean = false) {
  console.log(`[TEST PILOT] Starting sequence for lead ${leadId} with campaign ${campaignId}`);
  
  // Récupérer le lead pour déterminer le segment
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();
    
  if (leadError || !lead) {
    console.error(`[TEST PILOT] Error fetching lead ${leadId}:`, leadError);
    throw leadError;
  }
  
  // Déterminer le segment et le premier jour
  const segment = determineSegment(lead);
  const firstDay = segment === 'A' ? 3 : 7; // Segment A commence à J+3
  
  // Calculer la date du premier email (immédiat pour le test)
  const firstEmailDate = immediateStart ? new Date(Date.now() + 60000) : new Date(Date.now() + firstDay * 24 * 60 * 60 * 1000);
  
  const { error } = await supabase
    .from('lead_email_sequences')
    .insert({
      lead_id: leadId,
      campaign_id: campaignId,
      next_email_date: firstEmailDate.toISOString(),
      next_email_day: firstDay,
      last_activity_date: new Date().toISOString(),
      last_activity_type: 'sequence_started'
    });
    
  if (error) {
    console.error(`[TEST PILOT] Error starting sequence for lead ${leadId}:`, error);
    throw error;
  }
  
  console.log(`[TEST PILOT] Sequence started for lead ${leadId}, Segment ${segment}, First email: J+${firstDay}`);
  
  // Ajouter une action dans l'historique du lead
  await addActionToLead(leadId, `Email Auto J+${firstDay}`, firstEmailDate.toISOString(), `Séquence d'emails automatiques démarrée (Segment ${segment})`);
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
  console.log(`[TEST PILOT] Sending scheduled email to ${lead.email} (Day ${emailData.next_email_day})`);
  
  // Vérifier les conditions d'arrêt automatique
  const shouldStop = await checkAutoStopConditions(lead.id, emailData.id);
  if (shouldStop) {
    console.log(`[TEST PILOT] Auto-stop triggered for lead ${lead.id}`);
    return;
  }
  
  // Récupérer le template pour ce jour
  const { data: template, error: templateError } = await supabase
    .from('email_templates')
    .select('*')
    .eq('campaign_id', emailData.campaign_id)
    .eq('day_number', emailData.next_email_day)
    .single();
    
  if (templateError || !template) {
    console.error('[TEST PILOT] Template not found:', templateError);
    return;
  }
  
  // Récupérer les propriétés suggérées
  const suggestedProperties = await fetchSuggestedProperties(lead, 3);
  const detectedLanguage = detectLeadLanguage(lead);
  
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
      properties: suggestedProperties,
      language: detectedLanguage,
      leadId: lead.id,
      agentName: "Gadait International",
      agentSignature: "L'équipe Gadait International"
    })
  );
  
  // Envoyer l'email via Resend avec Pierre en CC
  const { data: emailResult, error: emailError } = await resend.emails.send({
    from: 'Gadait International <contact@gadait-international.com>',
    to: [lead.email],
    cc: ['pierre@gadait-international.com'],
    subject: personalizedSubject,
    html: emailHtml,
  });
  
  if (emailError) {
    console.error('[TEST PILOT] Failed to send email:', emailError);
    throw emailError;
  }
  
  console.log(`[TEST PILOT] Email sent successfully to ${lead.email}, CC to pierre@gadait-international.com`);
  
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

function detectLeadLanguage(lead: EnrichedLead): string {
  // 1. Priorité à preferred_language
  if (lead.preferred_language) {
    const lang = lead.preferred_language.toLowerCase();
    if (lang.includes('fr') || lang.includes('français')) return 'FR';
    if (lang.includes('en') || lang.includes('english') || lang.includes('anglais')) return 'EN';
    if (lang.includes('es') || lang.includes('español') || lang.includes('espagnol')) return 'ES';
  }
  
  // 2. Déduction par nationalité
  const frenchNationalities = ['Français', 'France', 'Suisse', 'Belgique', 'Belgian'];
  const englishNationalities = ['Britannique', 'British', 'Ireland', 'American', 'Canadian', 'Australian'];
  const spanishNationalities = ['Espagnol', 'Spanish', 'Mexicain', 'Mexican'];
  
  if (frenchNationalities.some(n => lead.nationality?.includes(n))) return 'FR';
  if (englishNationalities.some(n => lead.nationality?.includes(n))) return 'EN';
  if (spanishNationalities.some(n => lead.nationality?.includes(n))) return 'ES';
  
  // 3. Déduction par pays
  if (lead.country?.includes('France') || lead.country?.includes('Suisse')) return 'FR';
  if (lead.country?.includes('United Kingdom') || lead.country?.includes('Ireland')) return 'EN';
  
  // 4. Par défaut : Français
  return 'FR';
}

function determineSegment(lead: EnrichedLead): 'A' | 'B' | 'C' | 'D' {
  const budget = parseInt(lead.budget?.replace(/[^\d]/g, '') || '0');
  const hasHotTag = lead.tags?.includes('Hot');
  const hasSeriousTag = lead.tags?.includes('Serious');
  const hasColdTag = lead.tags?.includes('Cold');
  
  // Segment A - Ultra-Premium
  if ((hasHotTag || hasSeriousTag) && budget >= 2000000) {
    return 'A';
  }
  
  // Segment B - Premium Qualifié
  if (budget >= 500000 && (lead.location || lead.property_types?.length)) {
    return 'B';
  }
  
  // Segment C - À Réchauffer
  if (hasColdTag || budget < 500000) {
    return 'C';
  }
  
  // Segment D - Par défaut
  return 'D';
}

// Fonction pour récupérer les propriétés suggérées basées sur le profil du lead
async function fetchSuggestedProperties(lead: EnrichedLead, limit: number = 3): Promise<SuggestedProperty[]> {
  try {
    // Construire la requête avec filtres intelligents
    let query = supabase
      .from('properties_backoffice')
      .select('id, reference, title_fr, title_en, slug_fr, slug_en, price, currency, bedrooms, bathrooms, surface, images, location, country, property_type, amenities, views, status')
      .eq('status', 'published')
      .not('slug_fr', 'is', null)
      .not('slug_en', 'is', null);
    
    // Filtrer par pays/localisation si spécifié
    if (lead.country) {
      query = query.ilike('country', `%${lead.country}%`);
    } else if (lead.location) {
      query = query.or(`location.ilike.%${lead.location}%,country.ilike.%${lead.location}%`);
    }
    
    // Filtrer par budget (avec marge de 20%)
    if (lead.budget) {
      const budget = parseFloat(lead.budget.replace(/[^0-9.]/g, ''));
      if (!isNaN(budget)) {
        const maxPrice = budget * 1.2;
        query = query.lte('price', maxPrice);
      }
    }
    
    // Filtrer par type de propriété
    if (lead.property_types && lead.property_types.length > 0) {
      const types = lead.property_types.map(t => `property_type.ilike.%${t}%`).join(',');
      query = query.or(types);
    }
    
    // Filtrer par vue si spécifié
    if (lead.views && lead.views.includes('mer')) {
      query = query.or('views.cs.{mer},views.cs.{ocean},views.cs.{sea}');
    }
    
    // Ordonner par pertinence et limiter
    query = query.order('created_at', { ascending: false }).limit(limit);
    
    const { data: properties, error } = await query;
    
    if (error) {
      console.error('[FETCH PROPERTIES] Error:', error);
      return [];
    }
    
    if (!properties || properties.length === 0) {
      console.log('[FETCH PROPERTIES] No properties found, using fallback');
      // Fallback : récupérer les propriétés les plus récentes
      const { data: fallbackProperties } = await supabase
        .from('properties_backoffice')
        .select('id, reference, title_fr, title_en, slug_fr, slug_en, price, currency, bedrooms, bathrooms, surface, images, location, country')
        .eq('status', 'published')
        .not('slug_fr', 'is', null)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      return (fallbackProperties || []).map(p => ({
        id: p.id,
        reference: p.reference || '',
        title: p.title_fr || p.title_en || 'Propriété',
        slug: p.slug_fr || p.slug_en || '',
        price: p.price || 0,
        currency: p.currency || 'EUR',
        bedrooms: p.bedrooms || 0,
        bathrooms: p.bathrooms || 0,
        surface: p.surface || 0,
        images: p.images || [],
        location: p.location || '',
        country: p.country || ''
      }));
    }
    
    // Mapper au format SuggestedProperty
    return properties.map(p => ({
      id: p.id,
      reference: p.reference || '',
      title: p.title_fr || p.title_en || 'Propriété',
      slug: p.slug_fr || p.slug_en || '',
      price: p.price || 0,
      currency: p.currency || 'EUR',
      bedrooms: p.bedrooms || 0,
      bathrooms: p.bathrooms || 0,
      surface: p.surface || 0,
      images: p.images || [],
      location: p.location || '',
      country: p.country || ''
    }));
  } catch (error) {
    console.error('[FETCH PROPERTIES] Exception:', error);
    return [];
  }
}

async function generatePersonalizedContent(lead: any, template: any): Promise<string> {
  const detectedLanguage = detectLeadLanguage(lead);
  const segment = determineSegment(lead);
  
  const languageInstructions = {
    FR: 'Réponds en français formel (vouvoiement), ton élégant et professionnel style Loro Piana',
    EN: 'Respond in professional British English, elegant and sophisticated tone',
    ES: 'Responde en español formal (usted), tono elegante y profesional'
  };
  
  const prompt = `
Tu es un expert en immobilier de luxe pour Gadait International.
Génère un contenu d'email HYPER-PERSONNALISÉ pour ce lead premium.

📋 PROFIL DU LEAD:
- Nom: ${lead.name}
- Segment: ${segment} (A=Ultra-Premium, B=Premium, C=Réchauffer, D=Standard)
- Budget: ${lead.budget || 'Non spécifié'} ${lead.currency || 'EUR'}
- Localisation: ${lead.location || 'Non spécifié'}
- Pays: ${lead.country || 'Non spécifié'}
- Types de propriétés: ${lead.property_types?.join(', ') || 'Non spécifié'}
- Nationalité: ${lead.nationality || 'Non spécifié'}
- Langue préférée: ${lead.preferred_language || 'Non spécifié'}
- Vues souhaitées: ${lead.views || 'Non spécifié'}
- Équipements: ${lead.amenities || 'Non spécifié'}
- Délai d'achat: ${lead.purchase_timeframe || 'Non spécifié'}
- Financement: ${lead.financing_method || 'Non spécifié'}

🎯 INSTRUCTIONS:
${languageInstructions[detectedLanguage]}

Template de base: ${template.content_template}
Jour: J+${template.day_number}

✅ RÈGLES STRICTES:
1. ${languageInstructions[detectedLanguage]}
2. Personnalise PROFONDÉMENT basé sur TOUS les critères disponibles
3. Si "views" = "Vue mer" → Mentionne explicitement des villas avec vue mer
4. Si "amenities" rempli → Intègre ces équipements dans les suggestions
5. Si "purchase_timeframe" = court → Crée de l'urgence
6. Si budget >2M€ → Ton ultra-premium, biens exceptionnels uniquement
7. Si nationality renseignée → Ajoute insights fiscaux pertinents pour ce pays
8. Maximum 150 mots (les propriétés seront affichées automatiquement en dessous)
9. NE PAS mentionner de propriétés spécifiques - elles seront affichées visuellement
10. Format HTML simple: <p>, <strong>, <ul>, <li> uniquement
11. Call-to-action adapté au segment et au jour

Génère UNIQUEMENT le contenu HTML personnalisé (sans formules de politesse, gérées par le template).
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
          { role: 'system', content: 'Tu es un expert en communication immobilière de luxe multilingue.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('[TEST PILOT] Error generating AI content:', error);
    // Fallback multilingue
    const fallbacks = {
      FR: `<p>Nous espérons que vous allez bien et que votre projet immobilier avance selon vos souhaits.</p>
            <p>Nous avons sélectionné de nouvelles opportunités qui correspondent à vos critères${lead.location ? ` sur ${lead.location}` : ''}.</p>`,
      EN: `<p>We hope you are well and that your real estate project is progressing as planned.</p>
            <p>We have selected new opportunities that match your criteria${lead.location ? ` in ${lead.location}` : ''}.</p>`,
      ES: `<p>Esperamos que se encuentre bien y que su proyecto inmobiliario avance según lo previsto.</p>
            <p>Hemos seleccionado nuevas oportunidades que corresponden a sus criterios${lead.location ? ` en ${lead.location}` : ''}.</p>`
    };
    return fallbacks[detectedLanguage] || fallbacks.FR;
  }
}

async function checkAutoStopConditions(leadId: string, sequenceId: string): Promise<boolean> {
  // 1. Vérifier si le lead a cliqué sur 2+ propriétés
  const { data: clicks, error: clicksError } = await supabase
    .from('property_clicks')
    .select('id')
    .eq('lead_id', leadId)
    .gte('clicked_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    
  if (clicks && clicks.length >= 2) {
    await stopSequence(leadId, 'clicked_properties');
    console.log(`[TEST PILOT] Sequence stopped for ${leadId}: Multiple property clicks detected`);
    return true;
  }
  
  // 2. Vérifier si le lead a répondu à un email
  const { data: emailLog, error: emailError } = await supabase
    .from('automated_email_logs')
    .select('replied_at')
    .eq('lead_id', leadId)
    .not('replied_at', 'is', null)
    .single();
    
  if (emailLog) {
    await stopSequence(leadId, 'replied');
    console.log(`[TEST PILOT] Sequence stopped for ${leadId}: Lead replied`);
    return true;
  }
  
  // 3. Vérifier si le statut du lead a changé manuellement
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('status, tags')
    .eq('id', leadId)
    .single();
    
  if (lead && !lead.tags?.includes('No response')) {
    await stopSequence(leadId, 'status_changed');
    console.log(`[TEST PILOT] Sequence stopped for ${leadId}: Status changed manually`);
    return true;
  }
  
  // 4. Vérifier si 4 emails envoyés sans interaction
  const { data: sentEmails, error: sentError } = await supabase
    .from('automated_email_logs')
    .select('id, opened_at, clicked_at')
    .eq('lead_id', leadId)
    .order('sent_at', { ascending: false })
    .limit(4);
    
  if (sentEmails && sentEmails.length >= 4) {
    const hasAnyInteraction = sentEmails.some(e => e.opened_at || e.clicked_at);
    if (!hasAnyInteraction) {
      await stopSequence(leadId, 'no_engagement');
      console.log(`[TEST PILOT] Sequence stopped for ${leadId}: No engagement after 4 emails`);
      return true;
    }
  }
  
  return false;
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
  const sequence = [3, 7, 14, 21, 30, 60]; // Ajout de J+3 et J+60
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

async function sendTestEmailWithRealLead(leadId: string, templateDay: number) {
  console.log(`[TEST EMAIL] Sending test with real lead ${leadId}, template J+${templateDay}`);
  
  // Récupérer les données du lead
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select(`
      id, name, email, country, location, budget, currency,
      preferred_language, salutation, property_types, nationality,
      bedrooms, tags, notes, assigned_to, views, amenities,
      purchase_timeframe, financing_method, tax_residence
    `)
    .eq('id', leadId)
    .single();
    
  if (leadError || !lead) {
    console.error('[TEST EMAIL] Lead not found:', leadError);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Lead not found' 
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
  
  if (!lead.email) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Lead has no email' 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
  
  // Déterminer la langue et le segment
  const language = detectLeadLanguage(lead);
  const segment = determineSegment(lead);
  
  console.log(`[TEST EMAIL] Lead: ${lead.name}, Language: ${language}, Segment: ${segment}`);
  
  // Récupérer la campagne par défaut
  const campaignId = await getDefaultCampaignId();
  
  // Récupérer le template
  const { data: template, error: templateError } = await supabase
    .from('email_templates')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('day_number', templateDay)
    .single();
    
  if (templateError || !template) {
    console.error('[TEST EMAIL] Template not found:', templateError);
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Template J+${templateDay} not found` 
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
  
  // Récupérer les propriétés suggérées
  const suggestedProperties = await fetchSuggestedProperties(lead, 3);
  
  // Personnaliser avec l'IA
  const content = await generatePersonalizedContent(lead, template);
  const subject = personalizeTemplate(template.subject_template, lead);
  
  // Envoyer l'email de test
  const testSubject = `[TEST] ${subject}`;
  const testNotice = `
    <div style="background: #fff3cd; border: 2px solid #ffc107; padding: 15px; margin-bottom: 20px; border-radius: 5px; font-family: Arial, sans-serif;">
      <strong style="color: #856404;">🧪 EMAIL DE TEST - Ne pas répondre</strong><br>
      <span style="color: #856404;">Lead: ${lead.name} (${lead.email})</span><br>
      <span style="color: #856404;">Template: J+${templateDay} - ${template.template_name}</span><br>
      <span style="color: #856404;">Langue: ${language} | Segment: ${segment}</span><br>
      <span style="color: #856404;">Propriétés suggérées: ${suggestedProperties.length}</span>
    </div>
  `;
  
  // Render l'email avec React Email
  const emailHtml = await renderAsync(
    React.createElement(LoroEmailTemplate, {
      leadName: lead.name,
      leadSalutation: lead.salutation,
      subject: subject,
      content: testNotice + content,
      properties: suggestedProperties,
      language: language,
      leadId: lead.id,
      agentName: "Gadait International",
      agentSignature: "L'équipe Gadait International"
    })
  );
  
  try {
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Gadait International <contact@gadait-international.com>',
      to: ['pierre@gadait-international.com'],
      subject: testSubject,
      html: emailHtml,
    });
    
    if (emailError) {
      console.error('[TEST EMAIL] Error sending:', emailError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: emailError 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    console.log('[TEST EMAIL] Sent successfully to pierre@gadait-international.com');
    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailData,
      lead: {
        name: lead.name,
        email: lead.email,
        language,
        segment
      },
      template: {
        day: templateDay,
        name: template.template_name,
        subject
      }
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
    
  } catch (error) {
    console.error('[TEST EMAIL] Exception:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

async function sendPreviewEmails(targetEmail: string, leadData: any) {
  console.log(`Sending preview emails to ${targetEmail}`);
  
  // Récupérer la campagne par défaut
  const campaignId = await getDefaultCampaignId();
  
  // Récupérer tous les templates
  const { data: templates, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('day_number');
    
  if (error || !templates) {
    throw new Error('Templates not found');
  }
  
  let sentCount = 0;
  
  // Envoyer chaque email avec un délai de 2 secondes
  for (const template of templates) {
    try {
      const personalizedSubject = personalizeTemplate(template.subject_template, leadData);
      const emailHtml = await renderAsync(
        React.createElement(LoroEmailTemplate, {
          leadName: leadData.name,
          leadSalutation: leadData.salutation,
          subject: personalizedSubject,
          content: template.content_template,
          agentName: "Gadait International",
          agentSignature: "L'équipe Gadait International"
        })
      );
      
      // Envoyer l'email via Resend
      const { error: emailError } = await resend.emails.send({
        from: 'Gadait International <contact@gadait-international.com>',
        to: [targetEmail],
        subject: `[PREVIEW J+${template.day_number}] ${personalizedSubject}`,
        html: emailHtml,
      });
      
      if (emailError) {
        console.error(`Failed to send preview email ${template.day_number}:`, emailError);
      } else {
        sentCount++;
        console.log(`Preview email J+${template.day_number} sent successfully`);
      }
      
      // Délai de 2 secondes entre chaque email
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`Error sending preview email ${template.day_number}:`, error);
    }
  }
  
  return new Response(JSON.stringify({
    success: true,
    emailsSent: sentCount,
    message: `Sent ${sentCount} preview emails to ${targetEmail}`
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}