
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Gestion des requêtes CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Récupérer l'URL à partir de la requête
    const requestData = await req.json();
    const url = requestData.url;

    if (!url) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "URL manquante dans la requête",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Tentative d'extraction des données depuis: ${url}`);

    // Faire une requête à l'URL et récupérer le HTML
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération du site: ${response.status}`);
    }

    const html = await response.text();
    console.log(`HTML récupéré avec succès (${html.length} caractères)`);

    // Analyser le HTML pour extraire les propriétés
    const properties = extractProperties(url, html);
    console.log(`${properties.length} propriétés extraites`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${properties.length} propriétés extraites avec succès`,
        properties,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erreur lors du traitement de la requête:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: `Erreur serveur: ${error.message}`,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function extractProperties(url: string, html: string) {
  const $ = cheerio.load(html);
  const properties = [];
  
  // Détection du site web
  if (url.includes("the-private-collection.com")) {
    console.log("Site détecté: The Private Collection");
    
    // Extraction spécifique pour The Private Collection
    $(".property-item").each((index, element) => {
      const item = $(element);
      
      const property = {
        title: item.find(".property-title").text().trim(),
        price: item.find(".property-price").text().trim(),
        location: item.find(".property-location").text().trim(),
        description: item.find(".property-description").text().trim(),
        bedrooms: item.find(".property-bedrooms").text().trim(),
        bathrooms: item.find(".property-bathrooms").text().trim(),
        area: item.find(".property-area").text().trim(),
        reference: item.find(".property-reference").text().trim() || 
                  item.attr("data-reference") || 
                  `TPC-${index + 1}`,
        url: item.find("a.property-link").attr("href") || "",
        image: item.find(".property-image img").attr("src") || "",
      };
      
      properties.push(property);
    });
    
    if (properties.length === 0) {
      // Tentative alternative d'extraction si la première méthode échoue
      $(".property, .property-card, .listing-item").each((index, element) => {
        const item = $(element);
        
        const property = {
          title: item.find("h2, h3, .title").first().text().trim(),
          price: item.find(".price, [data-price]").first().text().trim(),
          location: item.find(".location, .address, .city").first().text().trim(),
          description: item.find(".description, .excerpt, p").first().text().trim(),
          reference: item.find(".reference, .ref, .id").first().text().trim() || 
                    item.attr("data-id") || 
                    `TPC-ALT-${index + 1}`,
          url: item.find("a").attr("href") || "",
          image: item.find("img").attr("src") || "",
        };
        
        properties.push(property);
      });
    }
  } else {
    // Extraction générique pour d'autres sites immobiliers
    console.log("Site non spécifiquement supporté, tentative d'extraction générique");
    
    // Tentative d'extraction basée sur des motifs communs d'annonces immobilières
    $("div[class*='property'], div[class*='listing'], div[class*='estate'], div[class*='real'], article, .card").each((index, element) => {
      const item = $(element);
      
      // Vérifier si c'est probablement une annonce immobilière
      const hasPrice = item.text().match(/(\$|€|£|USD|EUR)\s?[\d,.]+|[\d,.]+\s?(\$|€|£|USD|EUR)/i);
      const hasArea = item.text().match(/\d+\s?(m²|m2|sq\.m|square meter|ft²|sqft)/i);
      
      if (hasPrice || hasArea) {
        // Extraire tous les textes pour analyse
        const allText = item.text().trim();
        
        // Essayer de déduire le prix
        let price = "";
        const priceMatch = allText.match(/(\$|€|£|USD|EUR)\s?[\d,.]+|[\d,.]+\s?(\$|€|£|USD|EUR)/i);
        if (priceMatch) {
          price = priceMatch[0].trim();
        }
        
        // Essayer de déduire la localisation (souvent un mot suivi d'une virgule)
        let location = "";
        const locationElem = item.find("[class*='location'], [class*='address'], [class*='city'], address");
        if (locationElem.length) {
          location = locationElem.first().text().trim();
        }
        
        // Extraire le titre et la description
        let title = "";
        const titleElem = item.find("h1, h2, h3, h4, [class*='title']");
        if (titleElem.length) {
          title = titleElem.first().text().trim();
        }
        
        let description = "";
        const descElem = item.find("p, [class*='description'], [class*='excerpt']");
        if (descElem.length) {
          description = descElem.first().text().trim();
        }
        
        // Extraire l'URL de l'image principale
        let image = "";
        const imgElem = item.find("img");
        if (imgElem.length) {
          image = imgElem.first().attr("src") || "";
        }
        
        // Extraire l'URL de l'annonce
        let propertyUrl = "";
        const linkElem = item.find("a");
        if (linkElem.length) {
          propertyUrl = linkElem.first().attr("href") || "";
          
          // Convertir en URL absolue si nécessaire
          if (propertyUrl && !propertyUrl.startsWith("http")) {
            const urlObj = new URL(url);
            propertyUrl = `${urlObj.origin}${propertyUrl.startsWith("/") ? "" : "/"}${propertyUrl}`;
          }
        }
        
        const property = {
          title: title || "Propriété sans titre",
          price: price || "Prix sur demande",
          location: location || "Emplacement non spécifié",
          description: description || "Aucune description disponible",
          reference: `GEN-${index + 1}`,
          url: propertyUrl,
          image: image,
        };
        
        properties.push(property);
      }
    });
  }
  
  return properties;
}
