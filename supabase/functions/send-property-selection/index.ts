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
  locale?: 'fr' | 'en'; // Language selected by the agent
  properties: Array<{
    id: string;
    title: string;
    location: string;
    country?: string;
    price: number;
    currency: string;
    main_image: string;
    url: string;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    area_unit?: string;
    land_area?: number;
    land_area_unit?: string;
    property_type?: string;
    reference?: string;
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
      locale, // Language selected manually by the agent
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

    // Récupérer les informations du lead pour obtenir l'agent assigné, la langue et le type de pipeline
    const { data: leadData } = await supabase
      .from('leads')
      .select('assigned_to, preferred_language, pipeline_type, property_use')
      .eq('id', leadId)
      .single();

    // Récupérer le numéro WhatsApp et l'email de l'agent assigné
    let agentWhatsApp = null;
    let agentEmail = null;
    if (leadData?.assigned_to) {
      const { data: agentData } = await supabase
        .from('team_members')
        .select('whatsapp_number, email')
        .eq('id', leadData.assigned_to)
        .single();
      
      if (agentData?.whatsapp_number) {
        agentWhatsApp = agentData.whatsapp_number;
        console.log(`Agent WhatsApp trouvé: ${agentWhatsApp}`);
      }
      
      if (agentData?.email) {
        agentEmail = agentData.email;
        console.log(`Agent email trouvé: ${agentEmail}`);
      }
    }

    // Use manually selected locale if provided, otherwise use lead's preferred language
    const leadLanguage = locale || leadData?.preferred_language || 'fr';
    console.log(`Using language: ${leadLanguage} (locale: ${locale}, preferred: ${leadData?.preferred_language})`);

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

    // Translations based on selected language (must be defined BEFORE use)
    const t = leadLanguage === 'en' ? {
      emailTitle: 'Property Selection - GADAIT International',
      greeting: 'Dear',
      intro: 'We have carefully selected these properties that perfectly match your search criteria. Each property has been chosen for its exceptional quality and investment potential.',
      readyNext: '🤝 Ready for the next step?',
      teamMessage: 'Our team of experts is at your disposal to organize visits, answer your questions or support you in your investment project.',
      callUs: '📞 Call us',
      writeUs: 'Write to us',
      regards: 'Best regards,',
      teamSignature: 'The GADAIT International Team',
      footer: 'GADAIT International - Your trusted partner for luxury real estate',
      unsubscribe: 'You received this email because you are registered in our database. To unsubscribe, click here.',
      ref: 'Ref.',
    } : {
      emailTitle: 'Sélection de propriétés - GADAIT International',
      greeting: 'Bonjour',
      intro: 'Nous avons soigneusement sélectionné ces propriétés qui correspondent parfaitement à vos critères de recherche. Chaque propriété a été choisie pour sa qualité exceptionnelle et son potentiel d\'investissement.',
      readyNext: '🤝 Prêt pour la suite ?',
      teamMessage: 'Notre équipe d\'experts est à votre disposition pour organiser des visites, répondre à vos questions ou vous accompagner dans votre projet d\'investissement.',
      callUs: '📞 Nous appeler',
      writeUs: 'Nous écrire',
      regards: 'Cordialement,',
      teamSignature: 'L\'équipe GADAIT International',
      footer: 'GADAIT International - Votre partenaire de confiance pour l\'immobilier de luxe',
      unsubscribe: 'Vous recevez cet email car vous êtes inscrit dans notre base de données. Pour vous désinscrire, cliquez ici.',
      ref: 'Réf.',
    };

    // Générer le contenu HTML de l'email avec un design moderne et URLs trackées
    const propertiesHtml = properties.map((property, index) => {
      // Créer l'URL finale vers gadait-international.com
      const externalUrl = getExternalPropertyUrl(property, leadLanguage);
      
      // Créer l'URL trackée qui redirigera vers gadait-international.com
      const trackedUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/track-property-click?selection_id=${selectionData.id}&property_id=${property.id}&redirect_url=${encodeURIComponent(externalUrl)}`;
      
      // Créer le message WhatsApp pré-rempli
      const whatsappMessage = leadLanguage === 'en' 
        ? `Hello GADAIT International, I would like more information about this property.\nLink: ${externalUrl}`
        : `Bonjour GADAIT International, je souhaite avoir plus d'informations sur ce bien.\nLien : ${externalUrl}`;
      
      const whatsappUrl = agentWhatsApp 
        ? `https://wa.me/${agentWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`
        : null;
      
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
      
      // Build specs line
      const specs: string[] = [];
      if (property.bedrooms) specs.push(`${property.bedrooms} ${leadLanguage === 'en' ? 'bd' : 'ch'}`);
      if (property.bathrooms) specs.push(`${property.bathrooms} ${leadLanguage === 'en' ? 'ba' : 'sdb'}`);
      if (property.area) specs.push(`${property.area} ${property.area_unit || 'm²'}`);
      if (property.land_area) specs.push(`${leadLanguage === 'en' ? 'Land' : 'Terrain'}: ${property.land_area} ${property.land_area_unit || 'm²'}`);
      const specsLine = specs.join('  •  ');

      return `
      <!-- Carte de propriété - Design épuré Apple/Editorial -->
      <div style="
        background: white;
        border-radius: 16px;
        overflow: hidden;
        margin-bottom: 32px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        border: 1px solid #E5E7EB;
      ">
        
        ${property.main_image ? `
          <!-- Image ratio 4:3 -->
          <a href="${trackedUrl}" target="_blank" style="display: block; text-decoration: none;">
            <div style="position: relative; padding-top: 75%; overflow: hidden; background: #F3F4F6;">
              <img src="${property.main_image}" 
                   alt="${property.title}" 
                   style="
                     position: absolute;
                     top: 0;
                     left: 0;
                     width: 100%; 
                     height: 100%; 
                     object-fit: cover;
                   " />
              
              <!-- Badge discret type + pays en haut -->
              <div style="
                position: absolute;
                top: 16px;
                left: 16px;
                right: 16px;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
              ">
                ${property.property_type ? `
                  <span style="
                    background: rgba(255, 255, 255, 0.92);
                    backdrop-filter: blur(8px);
                    color: #374151;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 500;
                    letter-spacing: 0.3px;
                    text-transform: uppercase;
                  ">
                    ${property.property_type}${countryFlag ? ` · ${countryFlag}` : ''}
                  </span>
                ` : (countryFlag ? `
                  <span style="
                    background: rgba(255, 255, 255, 0.92);
                    backdrop-filter: blur(8px);
                    color: #374151;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 500;
                  ">
                    ${countryFlag}
                  </span>
                ` : '<span></span>')}
              </div>
            </div>
          </a>
        ` : ''}
        
        <!-- Contenu de la carte -->
        <div style="padding: 28px;">
          
          <!-- Titre -->
          <a href="${trackedUrl}" target="_blank" style="text-decoration: none; color: inherit;">
            <h3 style="
              margin: 0 0 8px 0;
              color: #111827;
              font-size: 20px;
              font-weight: 600;
              line-height: 1.35;
              letter-spacing: -0.2px;
            ">
              ${property.title}
            </h3>
          </a>
          
          <!-- Localisation -->
          <p style="
            margin: 0 0 16px 0;
            color: #6B7280;
            font-size: 14px;
            font-weight: 400;
          ">
            ${property.location || 'Localisation non spécifiée'}
          </p>
          
          <!-- Prix - Style éditorial grand -->
          <p style="
            margin: 0 0 12px 0;
            color: #111827;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.5px;
          ">
            ${formatPrice(property.price, property.currency)}
          </p>
          
          <!-- Specs inline avec séparateurs -->
          ${specsLine ? `
            <p style="
              margin: 0 0 20px 0;
              color: #9CA3AF;
              font-size: 13px;
              font-weight: 400;
              letter-spacing: 0.2px;
            ">
              ${specsLine}
            </p>
          ` : ''}
          
          <!-- Référence discrète -->
          ${property.reference ? `
            <p style="
              margin: 0 0 24px 0;
              color: #D1D5DB;
              font-size: 11px;
              font-weight: 400;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            ">
              ${t.ref} ${property.reference}
            </p>
          ` : '<div style="margin-bottom: 24px;"></div>'}
          
          <!-- CTA principal -->
          <a href="${trackedUrl}" 
             target="_blank" 
             style="
               display: block;
               width: 100%;
               background: #111827;
               color: white;
               text-align: center;
               padding: 14px 24px;
               border-radius: 10px;
               font-weight: 500;
               font-size: 14px;
               text-decoration: none;
               box-sizing: border-box;
               letter-spacing: 0.2px;
             ">
            ${leadLanguage === 'en' ? 'View on GADAIT →' : 'Voir sur GADAIT →'}
          </a>
          
          <!-- WhatsApp en lien texte discret -->
          ${whatsappUrl ? `
            <a href="${whatsappUrl}" 
               target="_blank" 
               style="
                 display: block;
                 width: 100%;
                 text-align: center;
                 padding: 14px 0 4px 0;
                 color: #6B7280;
                 font-size: 13px;
                 text-decoration: none;
                 font-weight: 400;
               ">
              💬 ${leadLanguage === 'en' ? 'Discuss on WhatsApp' : 'Discuter sur WhatsApp'}
            </a>
          ` : ''}
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
          <title>${t.emailTitle}</title>
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
              background: #FFFFFF;
              padding: 0;
            }
            
            .header {
              background: #FFFFFF;
              color: #111827;
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
        <body style="margin: 0; padding: 0; background: #F9FAFB; min-height: 100vh;">
          <div class="container">
            <div class="content" style="padding-top: 40px;">
              <div style="text-align: center; margin-bottom: 40px;">
                <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjgzLjE1MDM5IDI2OC42NjMwOSIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIzOCI+CiAgPGcgZmlsbD0iIzFBMUExQSI+CiAgICA8cGF0aCBkPSJNMTQwLjEyMzU0LDEzNC42NTMzMmgxMDIuNjM5MTZ2OC4yMDUwOGMwLDE4LjY2MTYyLTIuMTk5NzEsMzUuMTc4NzEtNi41OTYxOSw0OS41NDk4LTQuMjkxMDIsMTMuMjk5OC0xMS41MzAyNywyNS43NDAyMy0yMS43MTgyNiwzNy4zMjMyNC0yMy4wNjA1NSwyNS45NTYwNS01Mi4zOTMwNywzOC45MzE2NC04Ny45OTk1MSwzOC45MzE2NC0zNC43NDkwMiwwLTY0LjUxMTIzLTEyLjU0Nzg1LTg5LjI4NjEzLTM3LjY0NDUzQzEyLjM4NzcsMjA1LjgxNjQxLDAsMTc1LjU3MTI5LDAsMTQwLjI4NDE4LDAsMTA0LjI0ODA1LDEyLjYwMTA3LDczLjY4MTE1LDM3LjgwNjE1LDQ4LjU4NDQ3LDYzLjAwODMsMjMuMzgyMzIsOTMuNjgzMTEsMTAuNzc4ODEsMTI5LjgyNzE1LDEwLjc3ODgxYzE5LjQxMTEzLDAsMzcuNTM3MTEsMy45NjkyNCw1NC4zNzY0NiwxMS45MDQ3OSwxNi4wODc0LDcuOTM3OTksMzEuOTA2MjUsMjAuODA4MTEsNDcuNDU4NSwzOC42MTAzNWwtMjYuNzA1NTcsMjUuNTc5MWMtMjAuMzc4NDItMjcuMTMyODEtNDUuMjA2MDUtNDAuNzAxNjYtNzQuNDg1ODQtNDAuNzAxNjYtMjYuMjc3ODMsMC00OC4zMTc4Nyw5LjA2NDQ1LTY2LjEyMDEyLDI3LjE4Nzk5LTE3LjgwNDIsMTcuODA0NjktMjYuNzA1NTcsNDAuMTEzNzctMjYuNzA1NTcsNjYuOTI0OCwwLDI3LjY3MDksOS45MTk0Myw1MC40NjE5MSwyOS43NjIyMSw2OC4zNzIwNywxOC41NTM3MSwxNi42MjU5OCwzOC42NjMwOSwyNC45MzY1Miw2MC4zMjg2MSwyNC45MzY1MiwxOC40NDU4LDAsMzUuMDE1NjItNi4yMTg3NSw0OS43MTA5NC0xOC42NjIxMSwxNC42OTIzOC0xMi41NDc4NSwyMi44OTY5Ny0yNy41NjI1LDI0LjYxNDI2LTQ1LjA0NDkyaC02MS45Mzc1di0zNS4yMzI0MloiPjwvcGF0aD4KICAgIDxwYXRoIGQ9Ik00MjQuNTUyNzMsMjAzLjY2ODk1aC0xMDYuMzM4ODdsLTI3LjY3MDksNjAuMzI5MWgtNDAuMzc5ODhMMzczLjA3Mjc1LDBsMTE4LjU2NTQzLDI2My45OTgwNWgtNDEuMDIzNDRsLTI2LjA2MjAxLTYwLjMyOTFabS0xNS4yODMyLTM1LjIzMTQ1bC0zNi44NDAzMy04NC40NTk5Ni0zOC42MTAzNSw4NC40NTk5Nmg3NS40NTA2OFoiPjwvcGF0aD4KICAgIDxwYXRoIGQ9Ik01MjIuNjg3NSwyNjMuOTk4MDVWMTUuNjA0OThoNTIuMTI0MDJjMjQuOTg4MjgsMCw0NC43MjM2MywyLjQ2ODI2LDU5LjIwMjE1LDcuNDAwMzksMTUuNTQ5OCw0LjgyNjE3LDI5LjY1MzMyLDEzLjAzMDc2LDQyLjMxMTUyLDI0LjYxMzc3LDI1LjYzMDg2LDIzLjM4MjgxLDM4LjQ0OTIyLDU0LjEwOTg2LDM4LjQ0OTIyLDkyLjE4MjEzLDAsMzguMTgzMTEtMTMuMzUzNTIsNjkuMDcxNzgtNDAuMDU4NTksOTIuNjY0NTUtMTMuNDA4MiwxMS43OTk4LTI3LjQ1NzAzLDIwLjAwNDg4LTQyLjE0OTksMjQuNjE0MjYtMTMuNzI5OTgsNC42MTMyOC0zMy4xOTU4LDYuOTE3OTctNTguMzk3OTUsNi45MTc5N2gtNTEuNDgwNDdabTM3LjQ4Mzg5LTM1LjIzMTQ1aDE2Ljg5MjA5YzE2LjgzNjkxLDAsMzAuODMzMDEtMS43NzA1MSw0MS45ODg3Ny01LjMwOTU3LDExLjE1MzMyLTMuNzUyOTMsMjEuMjM1ODQtOS43MDUwOCwzMC4yNDU2MS0xNy44NTc0MiwxOC40NDUzMS0xNi44MzU5NCwyNy42Njk5Mi0zOC43NzA1MSwyNy42Njk5Mi02NS43OTgzNCwwLTI3LjI0MDcyLTkuMTE3MTktNDkuMzMzNS0yNy4zNDk2MS02Ni4yODA3Ni0xNi40MDg2OS0xNS4xMjI1Ni00MC41OTUyMS0yMi42ODM1OS03Mi41NTQ2OS0yMi42ODM1OWgtMTYuODkyMDlWMjI4Ljc2NjZaIj48L3BhdGg+CiAgICA8cGF0aCBkPSJNODk1LjU5ODYzLDIwMy42Njg5NWgtMTA2LjMzODg3bC0yNy42NzA5LDYwLjMyOTFoLTQwLjM3OTg4TDg0NC4xMTgxNiwwbDExOC41NjY0MSwyNjMuOTk4MDVoLTQxLjAyMzQ0bC0yNi4wNjI1LTYwLjMyOTFabS0xNS4yODMyLTM1LjIzMTQ1bC0zNi44NDA4Mi04NC40NTk5Ni0zOC42MTAzNSw4NC40NTk5Nmg3NS40NTExN1oiPjwvcGF0aD4KICAgIDxwYXRoIGQ9Ik0xMDMxLjIxNzc3LDE1LjYwNDk4djI0OC4zOTMwN2gtMzcuNDg0MzhWMTUuNjA0OThoMzcuNDg0MzhaIj48L3BhdGg+CiAgICA8cGF0aCBkPSJNMTE1OS40MzY1Miw1MC44MzY5MXYyMTMuMTYxMTNoLTM3LjQ4NDM4VjUwLjgzNjkxaC01Ny4xMTEzM1YxNS42MDQ5OGgxNTEuNTQ1OVY1MC44MzY5MWgtNTYuOTUwMloiPjwvcGF0aD4KICAgIDxwYXRoIGQ9Ik0xMjM4LjQyNjc2LDI0NS45Nzk0OWMwLTYuMDA0ODgsMi4xOTYyOS0xMS4yMDYwNSw2LjU5NTctMTUuNjA0NDksNC4zOTY0OC00LjM5NjQ4LDkuNjUyMzQtNi41OTU3LDE1Ljc2NTYyLTYuNTk1N3MxMS4zNjcxOSwyLjE5OTIyLDE1Ljc2NTYyLDYuNTk1Nyw0LjM5NjQ4LDQuMzk4NDQsNi41OTY2OCw5LjY1MjM0LDYuNTk2NjgsMTUuNzY1NjIsMCw2LjIyMTY4LTIuMjAwMiwxMS41MzAyNy02LjU5NjY4LDE1LjkyNjc2LTQuMjkxMDIsNC4yODgwOS05LjU0Njg4LDYuNDM1NTUtMTUuNzY1NjIsNi40MzU1NS02LjMyOTEsMC0xMS42Mzg2Ny0yLjE0NzQ2LTE1LjkyNjc2LTYuNDM1NTUtNC4yOTEwMi00LjI4ODA5LTYuNDM0NTctOS42NTIzNC02LjQzNDU3LTE2LjA4Nzg5WiI+PC9wYXRoPgogIDwvZz4KPC9zdmc+" 
                     alt="GADAIT International" 
                     style="height: 42px; width: auto;" />
              </div>
              <div style="margin-bottom: 32px;">
                <h2 style="
                  color: #111827;
                  font-size: 24px;
                  font-weight: 700;
                  margin: 0 0 16px 0;
                ">
                  ${t.greeting} ${leadName}
                </h2>
                <p style="
                  color: #6B7280;
                  font-size: 16px;
                  line-height: 1.6;
                  margin: 0;
                ">
                  ${t.intro}
                </p>
              </div>

              <div style="margin-bottom: 40px;">
                ${propertiesHtml}
              </div>

              <div style="
                background: #F9FAFB;
                border-radius: 16px;
                padding: 32px;
                text-align: center;
                border: 1px solid #E5E7EB;
              ">
                <h3 style="
                  color: #111827;
                  font-size: 20px;
                  font-weight: 700;
                  margin: 0 0 16px 0;
                ">
                  ${t.readyNext}
                </h3>
                <p style="
                  color: #6B7280;
                  font-size: 16px;
                  margin: 0 0 24px 0;
                  line-height: 1.6;
                ">
                  ${t.teamMessage}
                </p>
                <div style="
                  display: flex;
                  gap: 16px;
                  justify-content: center;
                  flex-wrap: wrap;
                ">
                  <a href="tel:+33123456789" style="
                    display: inline-block;
                    background: #111827;
                    color: white;
                    text-decoration: none;
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 14px;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                  ">
                    ${t.callUs}
                  </a>
                  <a href="mailto:contact@gadait-international.com" style="
                    display: inline-block;
                    background: #374151;
                    color: white;
                    text-decoration: none;
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 14px;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                  ">
                    ${t.writeUs}
                  </a>
                </div>
              </div>

              <div style="
                margin-top: 32px;
                padding-top: 24px;
                border-top: 1px solid #E5E7EB;
                text-align: center;
              ">
                <p style="
                  color: #6B7280;
                  font-size: 14px;
                  margin: 0 0 8px 0;
                  font-weight: 500;
                ">
                  ${t.regards}
                </p>
                <p style="
                  color: #111827;
                  font-size: 16px;
                  font-weight: 700;
                  margin: 0;
                ">
                  ${t.teamSignature}
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Générer un objet d'email dynamique et personnalisé basé sur "Votre projet à..."
    const generateSubject = (pipelineType?: string, propertyUse?: string) => {
      const count = properties.length;
      const isEN = leadLanguage === 'en';
      
      // Extraire les informations clés des propriétés
      const countries = [...new Set(properties.map(p => p.country).filter(Boolean))];
      const locations = [...new Set(properties.map(p => {
        // Extraire la ville/région de la localisation complète
        const loc = p.location || '';
        if (loc.includes(',')) {
          // Prendre la partie avant la première virgule (généralement la ville)
          return loc.split(',')[0].trim();
        }
        return loc;
      }).filter(Boolean))];
      const propertyTypes = [...new Set(properties.map(p => p.property_type).filter(Boolean))];
      
      // Déterminer le contexte du projet selon le lead
      const leadPipelineType = pipelineType || 'purchase';
      const leadPropertyUse = propertyUse;
      
      // Fonction pour obtenir le préfixe "Votre projet"
      const getProjectPrefix = (): string => {
        // Cas spécifique: Investissement
        if (leadPipelineType === 'purchase' && leadPropertyUse === 'investment') {
          return isEN ? 'Your investment project' : 'Votre projet d\'investissement';
        }
        
        // Cas spécifique: Résidence principale
        if (leadPipelineType === 'purchase' && leadPropertyUse === 'primary_residence') {
          return isEN ? 'Your future residence' : 'Votre future résidence';
        }
        
        // Cas spécifique: Résidence secondaire / Vacances
        if (leadPipelineType === 'purchase' && (leadPropertyUse === 'secondary_residence' || leadPropertyUse === 'vacation')) {
          return isEN ? 'Your vacation home' : 'Votre résidence de vacances';
        }
        
        // Cas spécifique: Location
        if (leadPipelineType === 'rental') {
          return isEN ? 'Your rental project' : 'Votre projet de location';
        }
        
        // Cas spécifique: Propriétaire (vente)
        if (leadPipelineType === 'owners') {
          return isEN ? 'Opportunities for your property' : 'Opportunités pour votre bien';
        }
        
        // Par défaut: projet immobilier générique
        return isEN ? 'Your real estate project' : 'Votre projet immobilier';
      };
      
      const prefix = getProjectPrefix();
      
      // Cas 1: Une seule propriété
      if (count === 1) {
        const prop = properties[0];
        const type = prop.property_type || '';
        const location = locations[0] || '';
        const country = countries[0] || '';
        
        // Avec localisation ET pays
        if (location && country) {
          const typeStr = type ? ` - ${type}` : '';
          return isEN 
            ? `${prefix} in ${location}, ${country}${typeStr}`
            : `${prefix} à ${location}, ${country}${typeStr}`;
        }
        // Avec pays uniquement
        if (country) {
          const typeStr = type ? ` - ${type}` : '';
          return isEN 
            ? `${prefix} in ${country}${typeStr}`
            : `${prefix} en ${country}${typeStr}`;
        }
        // Avec localisation uniquement (fallback)
        if (location) {
          const typeStr = type ? ` - ${type}` : '';
          return isEN 
            ? `${prefix} in ${location}${typeStr}`
            : `${prefix} à ${location}${typeStr}`;
        }
        return isEN 
          ? `${prefix} - Exceptional Property`
          : `${prefix} - Bien d'exception`;
      }
      
      // Cas 2: Toutes les propriétés dans la même ville/localisation
      if (locations.length === 1 && locations[0]) {
        const location = locations[0];
        const country = countries.length === 1 ? countries[0] : '';
        const locationStr = country ? `${location}, ${country}` : location;
        
        // Avec type de propriété spécifique
        if (propertyTypes.length === 1 && propertyTypes[0]) {
          return isEN
            ? `${prefix} in ${locationStr} - ${count} ${propertyTypes[0]}${count > 1 ? 's' : ''}`
            : `${prefix} à ${locationStr} - ${count} ${propertyTypes[0]}${count > 1 ? 's' : ''}`;
        }
        return isEN
          ? `${prefix} in ${locationStr} - ${count} ${count > 1 ? 'properties' : 'property'}`
          : `${prefix} à ${locationStr} - ${count} bien${count > 1 ? 's' : ''}`;
      }
      
      // Cas 3: Toutes les propriétés dans le même pays (mais différentes villes)
      if (countries.length === 1 && countries[0]) {
        const country = countries[0];
        
        // Avec type de propriété spécifique
        if (propertyTypes.length === 1 && propertyTypes[0]) {
          return isEN
            ? `${prefix} in ${country} - ${count} ${propertyTypes[0]}${count > 1 ? 's' : ''}`
            : `${prefix} en ${country} - ${count} ${propertyTypes[0]}${count > 1 ? 's' : ''}`;
        }
        return isEN
          ? `${prefix} in ${country} - ${count} ${count > 1 ? 'properties' : 'property'}`
          : `${prefix} en ${country} - ${count} propriété${count > 1 ? 's' : ''}`;
      }
      
      // Cas 4: Plusieurs localisations spécifiques (2-3 villes) - mettre le pays en avant
      if (locations.length >= 2 && locations.length <= 3) {
        const country = countries.length === 1 ? countries[0] : '';
        const locationsList = locations.join(', ');
        
        if (country) {
          // Format: "Votre projet en France - 2 biens à Nice, Cannes"
          return isEN
            ? `${prefix} in ${country} - ${count} ${count > 1 ? 'properties' : 'property'} in ${locationsList}`
            : `${prefix} en ${country} - ${count} bien${count > 1 ? 's' : ''} à ${locationsList}`;
        }
        
        // Sans pays unique
        return isEN
          ? `${prefix} - ${count} ${count > 1 ? 'properties' : 'property'} in ${locationsList}`
          : `${prefix} - ${count} bien${count > 1 ? 's' : ''} ${locationsList}`;
      }
      
      // Cas 5: Plusieurs pays (2-3 pays)
      if (countries.length >= 2 && countries.length <= 3) {
        return isEN
          ? `${prefix} - ${count} ${count > 1 ? 'properties' : 'property'} in ${countries.join(', ')}`
          : `${prefix} - ${count} bien${count > 1 ? 's' : ''} ${countries.join(', ')}`;
      }
      
      // Cas par défaut - avec au moins un pays si disponible
      if (countries.length > 0) {
        const moreText = countries.length > 1 ? (isEN ? ' and more' : ' et plus') : '';
        return isEN
          ? `${prefix} - ${count} ${count > 1 ? 'properties' : 'property'} in ${countries[0]}${moreText}`
          : `${prefix} - ${count} bien${count > 1 ? 's' : ''} en ${countries[0]}${moreText}`;
      }
      
      // Fallback final
      return isEN
        ? `${prefix} - ${count} exceptional ${count > 1 ? 'properties' : 'property'}`
        : `${prefix} - ${count} bien${count > 1 ? 's' : ''} d'exception`;
    };

    // Envoyer l'email
    const ccEmails = ["pierre@gadait-international.com"];
    if (agentEmail && agentEmail !== "pierre@gadait-international.com") {
      ccEmails.push(agentEmail);
    }
    
    const emailResponse = await resend.emails.send({
      from: "Gadait International <noreply@gadait-international.com>",
      to: [leadEmail],
      cc: ccEmails,
      subject: generateSubject(leadData?.pipeline_type, leadData?.property_use),
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