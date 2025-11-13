import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from "npm:resend@2.0.0";

// Import slug utility functions
const getExternalPropertyUrl = (property: {
  source?: string;
  url_fr?: string;
  url_en?: string;
  url?: string;
  slug_fr?: string;
  slug_en?: string;
  slug?: string;
}, locale: 'fr' | 'en' = 'fr') => {
  if (property.source === 'dato') {
    if (locale === 'fr' && property.url_fr) return property.url_fr;
    if (locale === 'en' && property.url_en) return property.url_en;
    if (property.url) return property.url;
  }
  
  const slug = locale === 'fr' 
    ? (property.slug_fr || property.slug)
    : (property.slug_en || property.slug);
    
  if (slug) {
    return `https://gadait-international.com/${locale}/${slug}`;
  }
  
  return 'https://gadait-international.com';
};

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
    source?: string;
    url_fr?: string;
    url_en?: string;
    slug?: string;
    slug_fr?: string;
    slug_en?: string;
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

    // Vérifier que l'email du lead est valide
    if (!leadEmail || leadEmail.trim() === '') {
      console.error('Erreur: Email du lead manquant', { leadId, leadName, leadEmail });
      return new Response(
        JSON.stringify({ 
          error: 'Email du lead manquant. Veuillez ajouter une adresse email au lead avant d\'envoyer une sélection.',
          leadEmail: leadEmail,
          leadName: leadName 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Enregistrer d'abord la sélection pour obtenir l'ID
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
      throw new Error("Impossible d'enregistrer la sélection");
    }

    console.log("Sélection enregistrée:", selectionData);

    // Générer le contenu HTML de l'email avec un design moderne et URLs trackées
    const propertiesHtml = properties.map((property, index) => {
      // Créer l'URL finale vers gadait-international.com
      const externalUrl = getExternalPropertyUrl(property, 'fr');
      
      // Créer l'URL trackée qui redirigera vers gadait-international.com
      const trackedUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/track-property-click?selection_id=${selectionData.id}&property_id=${property.id}&redirect_url=${encodeURIComponent(externalUrl)}`;
      
      // Formater le prix comme dans PropertyCard
      const formatPrice = (price?: number, currency?: string) => {
        if (!price) return 'Prix sur demande';
        const formatted = price >= 1000000 ? `${(price / 1000000).toFixed(1)}M` : price >= 1000 ? `${(price / 1000).toFixed(0)}K` : price.toLocaleString('fr-FR');
        return `${formatted} ${currency || 'EUR'}`;
      };

      // Get country flag
      const getCountryFlag = (country?: string) => {
        if (!country || country === 'Non spécifié') return '';
        const flags: { [key: string]: string } = {
          'France': '🇫🇷',
          'Mauritius': '🇲🇺',
          'Maurice': '🇲🇺',
          'Spain': '🇪🇸',
          'Espagne': '🇪🇸',
          'Portugal': '🇵🇹',
          'Italy': '🇮🇹',
          'Italie': '🇮🇹',
          'Greece': '🇬🇷',
          'Grèce': '🇬🇷',
          'Dubai': '🇦🇪',
          'United Arab Emirates': '🇦🇪',
          'Émirats arabes unis': '🇦🇪',
          'Thailand': '🇹🇭',
          'Thaïlande': '🇹🇭',
          'USA': '🇺🇸',
          'États-Unis': '🇺🇸',
          'United States': '🇺🇸',
        };
        return flags[country] || '';
      };

      const countryFlag = getCountryFlag(property.location?.split(',').pop()?.trim());
      
      return `
      <!-- Carte de propriété -->
      <div style="
        background: white;
        border-radius: 12px;
        overflow: hidden;
        margin-bottom: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e5e7eb;
      ">
        
        ${property.main_image ? `
          <!-- Image de la propriété avec overlay -->
          <div style="position: relative; height: 300px; overflow: hidden; background: #f3f4f6;">
            <a href="${trackedUrl}" target="_blank" style="display: block; width: 100%; height: 100%;">
              <img src="${property.main_image}" 
                   alt="${property.title}" 
                   style="
                     width: 100%; 
                     height: 100%; 
                     object-fit: cover;
                     display: block;
                   " />
            </a>
            
            <!-- Overlay gradient -->
            <div style="
              position: absolute;
              inset: 0;
              background: linear-gradient(to top, rgba(0,0,0,0.4), transparent, transparent);
              pointer-events: none;
            "></div>
            
            <!-- Badge type de propriété (en haut à gauche) -->
            ${property.property_type ? `
              <div style="
                position: absolute;
                top: 16px;
                left: 16px;
                background: rgba(255, 255, 255, 0.95);
                color: #1e293b;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                text-transform: lowercase;
                border: 1px solid rgba(226, 232, 240, 0.8);
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              ">
                ${property.property_type}
              </div>
            ` : ''}
            
            <!-- Prix (en haut à droite) -->
            <div style="
              position: absolute;
              top: 16px;
              right: 16px;
              background: rgba(255, 255, 255, 0.9);
              color: #1e293b;
              padding: 6px 12px;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 700;
              border: 1px solid rgba(226, 232, 240, 0.8);
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            ">
              ${formatPrice(property.price, property.currency)}
            </div>
            
            <!-- Caractéristiques (en bas à gauche) -->
            <div style="
              position: absolute;
              bottom: 16px;
              left: 16px;
              display: flex;
              gap: 8px;
              flex-wrap: wrap;
            ">
              ${property.area ? `
                <div style="
                  background: rgba(255, 255, 255, 0.9);
                  color: #1e293b;
                  padding: 6px 10px;
                  border-radius: 6px;
                  font-size: 11px;
                  font-weight: 600;
                  border: 1px solid rgba(226, 232, 240, 0.8);
                  display: inline-flex;
                  align-items: center;
                  gap: 4px;
                ">
                  <span style="font-size: 12px;">📐</span>
                  ${property.area} ${property.area_unit || 'm²'}
                </div>
              ` : ''}
              
              ${property.bedrooms ? `
                <div style="
                  background: rgba(255, 255, 255, 0.9);
                  color: #1e293b;
                  padding: 6px 10px;
                  border-radius: 6px;
                  font-size: 11px;
                  font-weight: 600;
                  border: 1px solid rgba(226, 232, 240, 0.8);
                  display: inline-flex;
                  align-items: center;
                  gap: 4px;
                ">
                  <span style="font-size: 12px;">🛏️</span>
                  ${property.bedrooms}
                </div>
              ` : ''}
              
              ${property.bathrooms ? `
                <div style="
                  background: rgba(255, 255, 255, 0.9);
                  color: #1e293b;
                  padding: 6px 10px;
                  border-radius: 6px;
                  font-size: 11px;
                  font-weight: 600;
                  border: 1px solid rgba(226, 232, 240, 0.8);
                  display: inline-flex;
                  align-items: center;
                  gap: 4px;
                ">
                  <span style="font-size: 12px;">🚿</span>
                  ${property.bathrooms}
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}
        
        <!-- Contenu de la carte -->
        <div style="padding: 20px;">
          <!-- Titre -->
          <a href="${trackedUrl}" target="_blank" style="text-decoration: none; color: inherit;">
            <h3 style="
              margin: 0 0 12px 0;
              color: #1e293b;
              font-size: 18px;
              font-weight: 600;
              line-height: 1.4;
            ">
              ${property.title}
            </h3>
          </a>
          
          <!-- Localisation et pays -->
          <div style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
            gap: 8px;
          ">
            <div style="
              display: flex;
              align-items: center;
              gap: 6px;
              color: #64748b;
              font-size: 14px;
              flex: 1;
            ">
              <span style="font-size: 14px;">📍</span>
              <span style="font-weight: 500;">${property.location || 'Localisation non spécifiée'}</span>
            </div>
            
            ${countryFlag ? `
              <div style="
                background: rgba(241, 245, 249, 0.5);
                color: #1e293b;
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
                border: 1px solid #e2e8f0;
                display: inline-flex;
                align-items: center;
                gap: 4px;
              ">
                <span>${countryFlag}</span>
                ${property.location?.split(',').pop()?.trim() || ''}
              </div>
            ` : ''}
          </div>
          
          <!-- Référence -->
          ${property.reference ? `
            <div style="
              color: #64748b;
              font-size: 14px;
              margin-bottom: 16px;
            ">
              Réf. ${property.reference}
            </div>
          ` : ''}
          
          <!-- Bouton CTA -->
          <a href="${trackedUrl}" 
             target="_blank" 
             style="
               display: block;
               width: 100%;
               background: white;
               color: #1e293b;
               text-align: center;
               padding: 10px 20px;
               border-radius: 8px;
               font-weight: 600;
               font-size: 14px;
               text-decoration: none;
               border: 1px solid #e5e7eb;
               box-sizing: border-box;
             ">
            <span style="margin-right: 6px;">🔗</span> Voir sur Gadait
          </a>
        </div>
      </div>
    `;
    }).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Sélection de propriétés - Gadait International</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              line-height: 1.6;
              color: #1a202c;
            }
            
            .container {
              max-width: 650px;
              margin: 0 auto;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 0;
            }
            
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-align: center;
              padding: 40px 32px;
            }
            
            .content {
              background: white;
              padding: 32px;
            }
            
            @media only screen and (max-width: 600px) {
              .container { width: 100% !important; }
              .content { padding: 20px !important; }
              .header { padding: 30px 20px !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); min-height: 100vh;">
          <div class="container">
            <div class="header">
              <div style="margin-bottom: 24px;">
                <div style="
                  background: white;
                  padding: 12px 20px;
                  border-radius: 12px;
                  display: inline-block;
                ">
                  <img src="https://www.gadait-international.com/static/media/logo.c86ab9e0598ca0f55b0db0ab4a7c6256.svg" 
                       alt="GADAIT International" 
                       style="
                         height: 40px;
                         width: auto;
                         display: block;
                       " />
                </div>
              </div>
              <h1 style="
                font-size: 32px;
                font-weight: 800;
                margin: 0 0 8px 0;
                text-shadow: 0 2px 4px rgba(0,0,0,0.1);
              ">
                ✨ ${criteriaLabel}
              </h1>
              <p style="
                font-size: 18px;
                margin: 0;
                opacity: 0.9;
                font-weight: 500;
              ">
                Sélection personnalisée par ${senderName}
              </p>
              <div style="
                margin-top: 16px;
                padding: 8px 16px;
                background: rgba(255,255,255,0.2);
                border-radius: 20px;
                display: inline-block;
                font-size: 14px;
                font-weight: 600;
              ">
                🏠 ${properties.length} propriété${properties.length > 1 ? 's' : ''} sélectionnée${properties.length > 1 ? 's' : ''}
              </div>
            </div>
            
            <div class="content">
              <div style="margin-bottom: 32px;">
                <h2 style="
                  color: #1a202c;
                  font-size: 24px;
                  font-weight: 700;
                  margin: 0 0 16px 0;
                ">
                  Bonjour ${leadName} 👋
                </h2>
                <p style="
                  color: #4a5568;
                  font-size: 16px;
                  line-height: 1.6;
                  margin: 0;
                ">
                  Nous avons soigneusement sélectionné ${properties.length > 1 ? 'ces propriétés' : 'cette propriété'} qui correspondent parfaitement à vos critères de recherche. Chaque propriété a été choisie pour sa qualité exceptionnelle et son potentiel d'investissement.
                </p>
              </div>

              <div style="margin-bottom: 40px;">
                ${propertiesHtml}
              </div>

              <div style="
                background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
                border-radius: 16px;
                padding: 32px;
                text-align: center;
                border: 1px solid #e2e8f0;
              ">
                <h3 style="
                  color: #1a202c;
                  font-size: 20px;
                  font-weight: 700;
                  margin: 0 0 16px 0;
                ">
                  🤝 Prêt pour la suite ?
                </h3>
                <p style="
                  color: #4a5568;
                  font-size: 16px;
                  margin: 0 0 24px 0;
                  line-height: 1.6;
                ">
                  Notre équipe d'experts est à votre disposition pour organiser des visites, répondre à vos questions ou vous accompagner dans votre projet d'investissement.
                </p>
                <div style="
                  display: flex;
                  gap: 16px;
                  justify-content: center;
                  flex-wrap: wrap;
                ">
                  <a href="tel:+33123456789" style="
                    display: inline-block;
                    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
                    color: white;
                    text-decoration: none;
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 14px;
                    box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
                  ">
                    📞 Nous appeler
                  </a>
                  <a href="mailto:contact@gadait-international.com" style="
                    display: inline-block;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-decoration: none;
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 14px;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                  ">
                    ✉️ Nous écrire
                  </a>
                </div>
              </div>

              <div style="
                margin-top: 32px;
                padding-top: 24px;
                border-top: 2px solid #e2e8f0;
                text-align: center;
              ">
                <p style="
                  color: #718096;
                  font-size: 14px;
                  margin: 0 0 8px 0;
                  font-weight: 500;
                ">
                  Cordialement,
                </p>
                <p style="
                  color: #1a202c;
                  font-size: 16px;
                  font-weight: 700;
                  margin: 0;
                ">
                  🏡 L'équipe Gadait International
                </p>
              </div>
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