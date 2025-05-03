
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;

// Initialize Resend client
const resend = new Resend(RESEND_API_KEY);

// Create a Supabase client with the admin key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeadData {
  id: string;
  salutation: string; // titre
  name: string;
  preferred_language: string; // langue_preferee
  email: string;
  url: string; // lien_annonce
  country: string; // pays_recherche
  location: string; // localisation
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse lead data from request body
    const leadData: LeadData = await req.json();
    console.log("Received lead data for email sending:", leadData);

    // Verify all required fields are present
    if (!leadData.id || !leadData.salutation || !leadData.name || !leadData.preferred_language || 
        !leadData.email || !leadData.url || !leadData.country || !leadData.location) {
      console.error("Missing required fields in lead data");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required fields in lead data" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Generate email subject
    const emailSubject = `Votre recherche à ${leadData.location} – Explorons ensemble les meilleures opportunités`;

    // Generate email HTML content
    const emailHtml = `
      Bonjour ${leadData.salutation} ${leadData.name},<br><br>

      Merci pour votre demande. Nous avons bien reçu votre intérêt pour un bien situé à <strong>${leadData.location}</strong>, en <strong>${leadData.country}</strong>.<br><br>

      Voici le lien de l'annonce que vous avez consultée :<br>
      <a href="${leadData.url}" target="_blank">Voir l'annonce</a><br><br>

      Afin que nous puissions vous faire une proposition parfaitement adaptée, pourriez-vous nous préciser quelques points ?<br><br>

      <b>Par simple réponse à cet e-mail</b>, ou en cliquant sur le bouton ci-dessous, vous pouvez nous indiquer :
      <ul>
        <li>Votre budget maximum</li>
        <li>Le nombre de chambres souhaité</li>
        <li>Le type de vue ou d'environnement recherché (mer, golf, calme, animé...)</li>
        <li>L'objectif de l'achat (résidence principale, secondaire, investissement)</li>
      </ul>

      <a href="https://www.world-of-gadait.com/personalise-your-needs" target="_blank" style="
        background-color: black;
        color: white;
        padding: 12px 20px;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
        display: inline-block;">Compléter mes critères</a><br><br>

      Nous sommes à votre entière disposition pour vous accompagner avec discrétion et efficacité.<br><br>

      Bien à vous,<br><br>
      <strong>L'équipe GADAIT International</strong><br>
      <a href="mailto:hello@gadait-international.com">hello@gadait-international.com</a><br>
      <a href="https://the-private-collection.com">www.the-private-collection.com</a>
    `;

    console.log("Sending email to:", leadData.email);

    // Send email using Resend
    const { data: emailResponse, error: emailError } = await resend.emails.send({
      from: "GADAIT International <hello@gadait-international.com>",
      to: [leadData.email],
      subject: emailSubject,
      html: emailHtml,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: emailError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("Email sent successfully, ID:", emailResponse?.id);

    // Update lead record to set email_envoye = true
    const { error: updateError } = await supabase
      .from("leads")
      .update({ email_envoye: true })
      .eq("id", leadData.id);

    if (updateError) {
      console.error("Error updating lead record:", updateError);
      return new Response(
        JSON.stringify({ 
          success: true, 
          emailId: emailResponse?.id,
          warning: "Email sent but failed to update lead record: " + updateError.message 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse?.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in send-prospect-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
