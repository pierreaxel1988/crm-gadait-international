import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse query parameters
    const url = new URL(req.url);
    const selectionId = url.searchParams.get('selection_id');
    const propertyId = url.searchParams.get('property_id');
    const redirectUrl = url.searchParams.get('redirect_url');

    if (!selectionId || !propertyId || !redirectUrl) {
      return new Response('Missing required parameters', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    console.log(`Tracking click: selection=${selectionId}, property=${propertyId}`);

    // Get selection details with lead info
    const { data: selection, error: selectionError } = await supabase
      .from('property_selections')
      .select(`
        id,
        lead_id,
        property_criteria,
        leads (
          id,
          name,
          email,
          assigned_to,
          country
        )
      `)
      .eq('id', selectionId)
      .single();

    if (selectionError || !selection) {
      console.error('Error fetching selection:', selectionError);
      // Still redirect even if we can't track
      return Response.redirect(decodeURIComponent(redirectUrl), 302);
    }

    const lead = selection.leads as any;

    // Get property details
    const { data: property, error: propertyError } = await supabase
      .from('gadait_properties')
      .select('title, location, price, currency, main_image')
      .eq('id', propertyId)
      .single();

    if (propertyError) {
      console.error('Error fetching property:', propertyError);
    }

    // Get user agent and IP for analytics
    const userAgent = req.headers.get('user-agent') || '';
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || '';

    // Insert click tracking record
    const { error: trackingError } = await supabase
      .from('property_click_tracking')
      .insert({
        selection_id: selectionId,
        property_id: propertyId,
        lead_id: lead?.id,
        redirect_url: decodeURIComponent(redirectUrl),
        user_agent: userAgent,
        ip_address: ipAddress,
      });

    if (trackingError) {
      console.error('Error inserting tracking record:', trackingError);
    } else {
      console.log('Click tracked successfully');
    }

    // Update selection link_visited_at
    await supabase
      .from('property_selections')
      .update({ link_visited_at: new Date().toISOString() })
      .eq('id', selectionId);

    // Get assigned commercial info
    if (lead?.assigned_to) {
      const { data: commercial, error: commercialError } = await supabase
        .from('team_members')
        .select('name, email')
        .eq('id', lead.assigned_to)
        .single();

      if (!commercialError && commercial?.email) {
        // Send notification email to commercial
        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Notification - Clic sur propriété</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                body {
                  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                  line-height: 1.6;
                  color: #1a202c;
                  margin: 0;
                  padding: 0;
                  background: #f7fafc;
                }
              </style>
            </head>
            <body style="margin: 0; padding: 20px; background: #f7fafc;">
              <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center;">
                  <div style="margin-bottom: 16px;">
                    <img src="https://www.gadait-international.com/static/media/logo.c86ab9e0598ca0f55b0db0ab4a7c6256.svg" 
                         alt="GADAIT International" 
                         style="height: 40px; width: auto; filter: brightness(0) invert(1);" />
                  </div>
                  <h1 style="color: white; font-size: 24px; font-weight: 700; margin: 0;">
                    🔔 Nouveau clic sur propriété
                  </h1>
                </div>

                <!-- Content -->
                <div style="padding: 32px;">
                  <div style="background: linear-gradient(135deg, #EBF8FF 0%, #E0E7FF 100%); padding: 20px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #667eea;">
                    <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1a202c;">
                      ✨ <strong>${lead?.name || 'Un lead'}</strong> vient de consulter une propriété que vous lui avez envoyée !
                    </p>
                  </div>

                  <!-- Lead Info -->
                  <div style="background: #f7fafc; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                    <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #1a202c;">
                      👤 Informations du lead
                    </h3>
                    <div style="display: grid; gap: 12px;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: 600; color: #4a5568; min-width: 100px;">Nom:</span>
                        <span style="color: #1a202c;">${lead?.name || 'N/A'}</span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: 600; color: #4a5568; min-width: 100px;">Email:</span>
                        <span style="color: #1a202c;">${lead?.email || 'N/A'}</span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: 600; color: #4a5568; min-width: 100px;">Pays:</span>
                        <span style="color: #1a202c;">${lead?.country || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Property Info -->
                  ${property ? `
                    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
                      ${property.main_image ? `
                        <img src="${property.main_image}" 
                             alt="${property.title}" 
                             style="width: 100%; height: 200px; object-fit: cover;" />
                      ` : ''}
                      <div style="padding: 16px;">
                        <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #1a202c;">
                          ${property.title}
                        </h3>
                        <p style="margin: 0 0 12px 0; color: #64748b; font-size: 14px;">
                          📍 ${property.location}
                        </p>
                        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 8px 16px; border-radius: 8px; display: inline-block;">
                          <span style="font-size: 18px; font-weight: 700;">
                            ${property.price ? `${property.price.toLocaleString()} ${property.currency || 'EUR'}` : 'Prix sur demande'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ` : ''}

                  <!-- CTA -->
                  <div style="text-align: center; margin-top: 32px;">
                    <a href="https://crm.gadait.com/leads/${lead?.id}" 
                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                      👁️ Voir le lead dans le CRM
                    </a>
                  </div>

                  <div style="margin-top: 24px; padding-top: 24px; border-top: 2px solid #e2e8f0; text-align: center;">
                    <p style="color: #718096; font-size: 14px; margin: 0;">
                      💡 <strong>Conseil:</strong> C'est le moment idéal pour recontacter ${lead?.name || 'ce lead'} et répondre à ses questions !
                    </p>
                  </div>
                </div>

                <!-- Footer -->
                <div style="background: #f7fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="color: #718096; font-size: 13px; margin: 0;">
                    GADAIT International CRM - Système de tracking automatique
                  </p>
                </div>
              </div>
            </body>
          </html>
        `;

        try {
          await resend.emails.send({
            from: "GADAIT CRM <noreply@gadait-international.com>",
            to: [commercial.email],
            subject: `🔔 ${lead?.name || 'Un lead'} a consulté une propriété que vous lui avez envoyée`,
            html: emailHtml,
          });
          console.log(`Notification email sent to ${commercial.email}`);
        } catch (emailError) {
          console.error('Error sending notification email:', emailError);
          // Don't fail the redirect if email fails
        }
      }
    }

    // Redirect to the property
    return Response.redirect(decodeURIComponent(redirectUrl), 302);

  } catch (error: any) {
    console.error("Error in track-property-click:", error);
    // Always try to redirect even on error
    const url = new URL(req.url);
    const redirectUrl = url.searchParams.get('redirect_url');
    if (redirectUrl) {
      return Response.redirect(decodeURIComponent(redirectUrl), 302);
    }
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
