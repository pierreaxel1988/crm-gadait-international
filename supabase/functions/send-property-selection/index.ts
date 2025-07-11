import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PropertySelectionRequest {
  leadId: string;
  properties: Array<{
    id: string;
    title: string;
    location: string;
    price: number;
    currency: string;
    main_image: string;
    url: string;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    area_unit?: string;
    property_type?: string;
  }>;
  leadName: string;
  leadEmail: string;
  senderName: string;
  criteriaLabel?: string;
}

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

    const { 
      leadId, 
      properties, 
      leadName, 
      leadEmail, 
      senderName,
      criteriaLabel = "Sélection de propriétés"
    }: PropertySelectionRequest = await req.json();

    console.log(`Envoi de ${properties.length} propriétés à ${leadEmail} (Lead: ${leadName})`);

    // Générer le contenu HTML de l'email
    const propertiesHtml = properties.map(property => `
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; background: white;">
        <div style="display: flex; gap: 16px;">
          ${property.main_image ? `
            <img src="${property.main_image}" 
                 alt="${property.title}" 
                 style="width: 200px; height: 150px; object-fit: cover; border-radius: 8px;" />
          ` : ''}
          <div style="flex: 1;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
              ${property.title}
            </h3>
            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
              📍 ${property.location}
            </p>
            <p style="margin: 0 0 8px 0; color: #059669; font-size: 16px; font-weight: 600;">
              ${property.price ? `${property.price.toLocaleString()} ${property.currency || 'EUR'}` : 'Prix sur demande'}
            </p>
            ${property.bedrooms || property.bathrooms || property.area ? `
              <div style="display: flex; gap: 16px; margin-bottom: 8px;">
                ${property.bedrooms ? `<span style="color: #6b7280; font-size: 14px;">🛏️ ${property.bedrooms} ch.</span>` : ''}
                ${property.bathrooms ? `<span style="color: #6b7280; font-size: 14px;">🚿 ${property.bathrooms} sdb.</span>` : ''}
                ${property.area ? `<span style="color: #6b7280; font-size: 14px;">📐 ${property.area} ${property.area_unit || 'm²'}</span>` : ''}
              </div>
            ` : ''}
            ${property.property_type ? `
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                🏠 ${property.property_type}
              </p>
            ` : ''}
            ${property.url ? `
              <a href="${property.url}" 
                 style="color: #2563eb; text-decoration: none; font-size: 14px; font-weight: 500;"
                 target="_blank">
                🔗 Voir plus de détails
              </a>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Sélection de propriétés - Gadait International</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 32px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #1f2937; font-size: 24px; margin: 0;">
                ${criteriaLabel}
              </h1>
              <p style="color: #6b7280; margin: 8px 0 0 0;">
                Sélection personnalisée par ${senderName}
              </p>
            </div>
            
            <div style="margin-bottom: 24px;">
              <p style="color: #1f2937; font-size: 16px; margin: 0 0 8px 0;">
                Bonjour ${leadName},
              </p>
              <p style="color: #1f2937; font-size: 14px; line-height: 1.5; margin: 0 0 16px 0;">
                Nous avons sélectionné ${properties.length} propriété${properties.length > 1 ? 's' : ''} qui pourrai${properties.length > 1 ? 'ent' : 't'} vous intéresser selon vos critères de recherche.
              </p>
            </div>

            <div style="margin-bottom: 32px;">
              ${propertiesHtml}
            </div>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">
                Pour plus d'informations ou pour organiser une visite, n'hésitez pas à nous contacter.
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Cordialement,<br>
                <strong>L'équipe Gadait International</strong>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Envoyer l'email
    const emailResponse = await resend.emails.send({
      from: "Gadait International <noreply@gadait-international.com>",
      to: [leadEmail],
      cc: ["pierre@gadait-international.com"], // Ajout de la copie
      subject: `${criteriaLabel} - ${properties.length} propriété${properties.length > 1 ? 's' : ''} sélectionnée${properties.length > 1 ? 's' : ''} pour vous`,
      html: emailHtml,
    });

    console.log("Email envoyé avec succès:", emailResponse);

    // Enregistrer la sélection en base de données
    const { data: selectionData, error: selectionError } = await supabase
      .from('property_selections')
      .insert({
        lead_id: leadId,
        name: criteriaLabel,
        properties: properties.map(p => p.id),
        property_criteria: {
          lead_name: leadName,
          lead_email: leadEmail,
          sender_name: senderName,
          properties_count: properties.length
        },
        email_sent_at: new Date().toISOString(),
        status: 'sent'
      })
      .select()
      .single();

    if (selectionError) {
      console.error("Erreur lors de l'enregistrement de la sélection:", selectionError);
    } else {
      console.log("Sélection enregistrée:", selectionData);
    }

    return new Response(JSON.stringify({
      success: true,
      emailId: emailResponse.data?.id,
      selectionId: selectionData?.id,
      message: `Email envoyé avec succès à ${leadEmail} avec copie à pierre@gadait-international.com`
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Erreur dans send-property-selection:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);