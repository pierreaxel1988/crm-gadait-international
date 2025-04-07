
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const { type, email } = await req.json();
    
    // Vérifiez que le type et l'email sont fournis
    if (!type || !email) {
      return new Response(
        JSON.stringify({ error: "Type et email sont requis" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Générer le template d'email en fonction du type
    const emailHtml = generateEmailTemplate(type, email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        template: emailHtml 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Erreur:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

const generateEmailTemplate = (type: string, email: string): string => {
  const baseUrl = Deno.env.get("PUBLIC_URL") || "https://app.gadait-international.com";
  
  // Template pour l'invitation
  if (type === "invite") {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Invitation GADAIT International</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #eaeaea;
        }
        .header h1 {
          color: #0e3866;
          margin: 0;
        }
        .content {
          padding: 30px 0;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          color: #888;
          font-size: 14px;
          border-top: 1px solid #eaeaea;
        }
        .button {
          display: inline-block;
          background-color: #0e3866;
          color: white !important;
          padding: 12px 25px;
          text-decoration: none;
          border-radius: 4px;
          margin: 20px 0;
          font-weight: bold;
        }
        .logo {
          max-width: 200px;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>GADAIT INTERNATIONAL</h1>
        </div>
        <div class="content">
          <p>Bonjour,</p>
          <p>Vous avez été invité(e) à rejoindre la plateforme GADAIT International pour notre système de gestion des leads.</p>
          <p>Veuillez cliquer sur le bouton ci-dessous pour configurer votre compte :</p>
          <div style="text-align: center;">
            <a href="${baseUrl}/auth" class="button">Configurer mon compte</a>
          </div>
          <p>Si le bouton ne fonctionne pas, vous pouvez également copier et coller ce lien dans votre navigateur :</p>
          <p>${baseUrl}/auth</p>
          <p>Ce lien est valable pendant 24 heures.</p>
        </div>
        <div class="footer">
          <p>GADAIT International</p>
          <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }
  
  // Template pour la confirmation d'email
  if (type === "confirmation") {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Confirmation d'Email GADAIT International</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #eaeaea;
        }
        .header h1 {
          color: #0e3866;
          margin: 0;
        }
        .content {
          padding: 30px 0;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          color: #888;
          font-size: 14px;
          border-top: 1px solid #eaeaea;
        }
        .button {
          display: inline-block;
          background-color: #0e3866;
          color: white !important;
          padding: 12px 25px;
          text-decoration: none;
          border-radius: 4px;
          margin: 20px 0;
          font-weight: bold;
        }
        .logo {
          max-width: 200px;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>GADAIT INTERNATIONAL</h1>
        </div>
        <div class="content">
          <p>Bonjour,</p>
          <p>Merci de vous être inscrit(e) sur notre plateforme. Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
          <div style="text-align: center;">
            <a href="${baseUrl}/auth" class="button">Confirmer mon email</a>
          </div>
          <p>Si le bouton ne fonctionne pas, vous pouvez également copier et coller ce lien dans votre navigateur :</p>
          <p>${baseUrl}/auth</p>
          <p>Ce lien est valable pendant 24 heures.</p>
        </div>
        <div class="footer">
          <p>GADAIT International</p>
          <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }
  
  // Template par défaut
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>GADAIT International</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      .button {
        display: inline-block;
        background-color: #0e3866;
        color: white !important;
        padding: 12px 25px;
        text-decoration: none;
        border-radius: 4px;
        margin: 20px 0;
      }
    </style>
  </head>
  <body>
    <h1>GADAIT INTERNATIONAL</h1>
    <p>Bonjour,</p>
    <p>Veuillez cliquer sur le lien ci-dessous pour accéder à votre compte :</p>
    <p><a href="${baseUrl}/auth" class="button">Accéder à mon compte</a></p>
    <p>Cordialement,</p>
    <p>L'équipe GADAIT International</p>
  </body>
  </html>
  `;
};

// Créer une fonction pour partager les headers CORS
<lov-write file_path="supabase/functions/_shared/cors.ts">
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};
