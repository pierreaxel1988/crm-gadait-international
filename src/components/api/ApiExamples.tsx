
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CodeBlock from './CodeBlock';

interface ApiExamplesProps {
  baseApiUrl: string;
  apiKeyPlaceholder: string;
}

const ApiExamples = ({ baseApiUrl, apiKeyPlaceholder }: ApiExamplesProps) => {
  const curlExample = `curl -X POST ${baseApiUrl} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKeyPlaceholder}" \\
  -d '{
    "name": "Jean Dupont",
    "email": "jean.dupont@example.com",
    "phone": "+33612345678",
    "source": "Site web",
    "message": "Intéressé par une propriété"
  }'`;
  
  const portalExample = `curl -X POST ${baseApiUrl} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKeyPlaceholder}" \\
  -d '{
    "portal_name": "Le Figaro",
    "name": "Simona Jouron",
    "email": "Simona.jouron@yahoo.fr",
    "phone": "(+41) 763010743",
    "country": "Suisse",
    "property_type": "Chalet",
    "budget_min": "1800000",
    "budget_max": "2600000",
    "desired_location": "Megeve",
    "votre_reference": "85697523",
    "reference_portal": "80884566",
    "message": "Je souhaite avoir plus d'informations sur votre programme à Megeve notamment ce qu'il est inclu dans le prix et le calendrier",
    "property_price": "2290000 €",
    "property_area": "224",
    "property_bedrooms": "4",
    "property_city": "Megeve (74)",
    "property_description": "Les Chalets de Tirecorde est un projet de trois chalets en cours de construction, situé dans un cadre calme et privé sur les hauteurs du quartier des Grabilles, à Megève."
  }'`;
  
  const fetchExample = `fetch("${baseApiUrl}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${apiKeyPlaceholder}"
  },
  body: JSON.stringify({
    name: "Marie Martin",
    email: "marie.martin@example.com",
    phone: "+33687654321",
    source: "Le Figaro",
    property_reference: "VIL-123",
    message: "Recherche villa avec piscine"
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error("Erreur:", error));`;
  
  const emailParserExample = `// Cette fonction peut être utilisée pour parser les emails des portails immobiliers
// et les envoyer à l'API Loro CRM
function parseRealEstateEmail(emailContent) {
  // Exemple pour Le Figaro
  const data = {};
  
  // Extraction du nom
  const nameMatch = emailContent.match(/Nom : ([^\\n]+)/);
  if (nameMatch) data.name = nameMatch[1].trim();
  
  // Extraction de l'email
  const emailMatch = emailContent.match(/Email : ([^\\n]+)/);
  if (emailMatch) data.email = emailMatch[1].trim();
  
  // Extraction du téléphone
  const phoneMatch = emailContent.match(/Téléphone : ([^\\n]+)/);
  if (phoneMatch) data.phone = phoneMatch[1].trim();
  
  // Extraction du pays
  const countryMatch = emailContent.match(/Pays : ([^\\n]+)/);
  if (countryMatch) data.country = countryMatch[1].trim();
  
  // Extraction du budget
  const budgetMatch = emailContent.match(/de ([0-9 ]+) à ([0-9 ]+) €/);
  if (budgetMatch) {
    data.budget_min = budgetMatch[1].replace(/\\s/g, '');
    data.budget_max = budgetMatch[2].replace(/\\s/g, '');
  }
  
  // Extraction du type de bien
  const propertyTypeMatch = emailContent.match(/• ([^\\n•]+)\\n/g);
  if (propertyTypeMatch && propertyTypeMatch.length > 2) {
    data.property_type = propertyTypeMatch[2].replace(/•\\s+/, '').trim();
  }
  
  // Extraction de la localisation
  const locationMatch = emailContent.match(/• ([^\\n•]+)\\n/g);
  if (locationMatch && locationMatch.length > 1) {
    data.desired_location = locationMatch[1].replace(/•\\s+/, '').trim();
  }
  
  // Extraction du message
  const messageMatch = emailContent.match(/Bonjour,[\\s\\S]*?Cordialement/);
  if (messageMatch) data.message = messageMatch[0].trim();
  
  // Extraction de la référence
  const referenceMatch = emailContent.match(/Votre Référence : ([^\\n-]+)/);
  if (referenceMatch) data.votre_reference = referenceMatch[1].trim();
  
  // Ajout de l'information du portail
  data.portal_name = "Le Figaro";
  
  return data;
}

// Envoi des données à l'API
async function sendToLoroCRM(data) {
  try {
    const response = await fetch("${baseApiUrl}", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer ${apiKeyPlaceholder}"
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    console.log("Lead importé avec succès:", result);
    return result;
  } catch (error) {
    console.error("Erreur lors de l'envoi du lead:", error);
    throw error;
  }
}`;
  
  const gmailAddOnExample = `/**
 * Script Google Apps pour traiter les emails des portails immobiliers
 * et les envoyer à l'API Loro CRM
 */

// Création d'un menu personnalisé dans Gmail
function onGmailMessage(e) {
  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle('Loro CRM'))
    .addSection(
      CardService.newCardSection()
        .addWidget(CardService.newTextButton()
          .setText('Importer ce lead dans Loro CRM')
          .setOnClickAction(CardService.newAction()
            .setFunctionName('importLeadFromEmail')))
    )
    .build();
}

// Fonction pour importer le lead depuis l'email
function importLeadFromEmail(e) {
  const messageId = e.messageMetadata.messageId;
  const message = GmailApp.getMessageById(messageId);
  const subject = message.getSubject();
  const body = message.getPlainBody();
  
  // Détecter le portail immobilier
  let portalName = "Unknown";
  if (subject.includes("Figaro") || body.includes("Propriétés Le Figaro")) {
    portalName = "Le Figaro";
  } else if (subject.includes("Idealista") || body.includes("Idealista")) {
    portalName = "Idealista";
  }
  // etc. pour d'autres portails
  
  // Parser le contenu de l'email
  const leadData = parseEmailContent(body, portalName);
  
  // Envoyer à l'API Loro CRM
  const response = sendToLoroCRM(leadData);
  
  if (response.success) {
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification()
        .setText("Lead importé avec succès dans Loro CRM"))
      .build();
  } else {
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification()
        .setText("Erreur: " + response.error))
      .build();
  }
}

// Fonction pour parser le contenu de l'email
function parseEmailContent(body, portalName) {
  // Logique spécifique de parsing selon le portail
  // ...
  
  return {
    portal_name: portalName,
    name: "Nom extrait",
    email: "email@extrait.com",
    // autres champs...
  };
}

// Fonction pour envoyer à l'API Loro CRM
function sendToLoroCRM(data) {
  const apiUrl = "${baseApiUrl}";
  const apiKey = "${apiKeyPlaceholder}"; // À remplacer par votre clé API
  
  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "Authorization": "Bearer " + apiKey
    },
    payload: JSON.stringify(data),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(apiUrl, options);
    return JSON.parse(response.getContentText());
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}`;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Exemples d'intégration</h3>
      <Tabs defaultValue="simple">
        <TabsList className="mb-4">
          <TabsTrigger value="simple">API Simple</TabsTrigger>
          <TabsTrigger value="portal">Portail Immobilier</TabsTrigger>
          <TabsTrigger value="fetch">JavaScript</TabsTrigger>
          <TabsTrigger value="email">Parser d'Email</TabsTrigger>
          <TabsTrigger value="gmail">Extension Gmail</TabsTrigger>
        </TabsList>
        
        <TabsContent value="simple">
          <CodeBlock code={curlExample} id="curl" />
        </TabsContent>
        
        <TabsContent value="portal">
          <CodeBlock code={portalExample} id="portal" />
        </TabsContent>
        
        <TabsContent value="fetch">
          <CodeBlock code={fetchExample} id="fetch" />
        </TabsContent>
        
        <TabsContent value="email">
          <CodeBlock code={emailParserExample} id="email" />
        </TabsContent>
        
        <TabsContent value="gmail">
          <CodeBlock code={gmailAddOnExample} id="gmail" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiExamples;
