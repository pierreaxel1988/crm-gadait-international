
import React, { useState } from 'react';
import { Code, Copy, Check, ExternalLink } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const LeadApiGuide = () => {
  const [copied, setCopied] = useState<string | null>(null);
  
  const baseApiUrl = 'https://hxqoqkfnhbpwzkjgukrc.supabase.co/functions/v1/import-lead';
  
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const apiKeyPlaceholder = 'votre-clé-API-supabase';
  
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
    <div className="luxury-card p-6">
      <h2 className="text-xl font-semibold mb-4">Guide d'intégration API</h2>
      
      <Alert className="mb-6">
        <AlertTitle className="font-semibold">Important</AlertTitle>
        <AlertDescription>
          Cette API vous permet d'importer automatiquement des leads de vos portails immobiliers dans votre CRM Loro.
          Vous aurez besoin d'une clé API Supabase pour authentifier vos requêtes.
        </AlertDescription>
      </Alert>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">URL de l'API</h3>
        <div className="flex items-center gap-2 mb-4">
          <code className="bg-muted px-3 py-2 rounded-md text-sm flex-1">{baseApiUrl}</code>
          <button 
            className="p-2 rounded-md hover:bg-muted transition-colors"
            onClick={() => copyToClipboard(baseApiUrl, 'url')}
          >
            {copied === 'url' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Paramètres obligatoires</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4 text-left">Champ</th>
              <th className="py-2 px-4 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 px-4"><code>name</code></td>
              <td className="py-2 px-4">Nom complet du lead</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-4"><code>email</code></td>
              <td className="py-2 px-4">Adresse e-mail du lead</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Paramètres spécifiques aux portails</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4 text-left">Champ</th>
              <th className="py-2 px-4 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 px-4"><code>portal_name</code></td>
              <td className="py-2 px-4">Nom du portail immobilier (Le Figaro, Idealista, etc.)</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-4"><code>property_reference</code> ou <code>votre_reference</code></td>
              <td className="py-2 px-4">Référence de votre bien immobilier</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-4"><code>reference_portal</code> ou <code>portal_reference</code></td>
              <td className="py-2 px-4">Référence du bien sur le portail</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-4"><code>property_type</code></td>
              <td className="py-2 px-4">Type de bien (Villa, Appartement, Chalet, etc.)</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-4"><code>budget_min</code> / <code>budget_max</code></td>
              <td className="py-2 px-4">Budget min/max du prospect</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-4"><code>desired_location</code> ou <code>property_city</code></td>
              <td className="py-2 px-4">Localisation souhaitée</td>
            </tr>
          </tbody>
        </table>
      </div>
      
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
          
          <TabsContent value="simple" className="relative">
            <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">{curlExample}</pre>
            <button 
              className="absolute top-2 right-2 p-2 rounded-md hover:bg-background transition-colors"
              onClick={() => copyToClipboard(curlExample, 'curl')}
            >
              {copied === 'curl' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </TabsContent>
          
          <TabsContent value="portal" className="relative">
            <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">{portalExample}</pre>
            <button 
              className="absolute top-2 right-2 p-2 rounded-md hover:bg-background transition-colors"
              onClick={() => copyToClipboard(portalExample, 'portal')}
            >
              {copied === 'portal' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </TabsContent>
          
          <TabsContent value="fetch" className="relative">
            <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">{fetchExample}</pre>
            <button 
              className="absolute top-2 right-2 p-2 rounded-md hover:bg-background transition-colors"
              onClick={() => copyToClipboard(fetchExample, 'fetch')}
            >
              {copied === 'fetch' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </TabsContent>
          
          <TabsContent value="email" className="relative">
            <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">{emailParserExample}</pre>
            <button 
              className="absolute top-2 right-2 p-2 rounded-md hover:bg-background transition-colors"
              onClick={() => copyToClipboard(emailParserExample, 'email')}
            >
              {copied === 'email' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </TabsContent>
          
          <TabsContent value="gmail" className="relative">
            <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">{gmailAddOnExample}</pre>
            <button 
              className="absolute top-2 right-2 p-2 rounded-md hover:bg-background transition-colors"
              onClick={() => copyToClipboard(gmailAddOnExample, 'gmail')}
            >
              {copied === 'gmail' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Pour intégrer cette API avec vos portails immobiliers, vous pouvez soit:
        </p>
        <ul className="text-sm text-muted-foreground list-disc list-inside mt-2">
          <li>Développer un script qui traite les emails reçus et les envoie à l'API</li>
          <li>Créer une extension pour Gmail qui permet d'importer les leads en un clic</li>
          <li>Demander au portail immobilier s'ils peuvent envoyer les leads directement via API</li>
        </ul>
      </div>
    </div>
  );
};

export default LeadApiGuide;
