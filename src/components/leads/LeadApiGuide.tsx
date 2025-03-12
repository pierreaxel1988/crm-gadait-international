
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
  
  const phpExample = `<?php
$url = "${baseApiUrl}";
$data = array(
  'name' => 'Pierre Durand',
  'email' => 'pierre.durand@example.com',
  'phone' => '+33654321987',
  'source' => 'Idealista',
  'property_reference' => 'APT-456',
  'message' => 'Recherche appartement centre-ville'
);

$options = array(
  'http' => array(
    'header'  => "Content-type: application/json\\r\\nAuthorization: Bearer ${apiKeyPlaceholder}\\r\\n",
    'method'  => 'POST',
    'content' => json_encode($data)
  )
);

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

echo $result;
?>`;

  const wordpressExample = `// Ajoutez ce code à functions.php de votre thème ou dans un plugin personnalisé
add_action('wpcf7_mail_sent', 'send_lead_to_loro_crm');

function send_lead_to_loro_crm($contact_form) {
  $submission = WPCF7_Submission::get_instance();
  
  if ($submission) {
    $posted_data = $submission->get_posted_data();
    
    // Adaptez ces champs en fonction de votre formulaire
    $name = $posted_data['your-name'] ?? '';
    $email = $posted_data['your-email'] ?? '';
    $phone = $posted_data['your-phone'] ?? '';
    $message = $posted_data['your-message'] ?? '';
    
    $url = "${baseApiUrl}";
    $body = array(
      'name' => $name,
      'email' => $email,
      'phone' => $phone,
      'source' => 'Site web',
      'integration_source' => 'wordpress',
      'message' => $message
    );
    
    $args = array(
      'body' => json_encode($body),
      'headers' => array(
        'Content-Type' => 'application/json',
        'Authorization' => 'Bearer ${apiKeyPlaceholder}'
      ),
      'method' => 'POST',
      'timeout' => 30
    );
    
    $response = wp_remote_post($url, $args);
    
    if (is_wp_error($response)) {
      error_log('Erreur lors de l\'envoi du lead: ' . $response->get_error_message());
    } else {
      error_log('Lead envoyé avec succès au CRM Loro');
    }
  }
}`;

  return (
    <div className="luxury-card p-6">
      <h2 className="text-xl font-semibold mb-4">Guide d'intégration API</h2>
      
      <Alert className="mb-6">
        <AlertTitle className="font-semibold">Important</AlertTitle>
        <AlertDescription>
          Cette API vous permet d'importer automatiquement des leads dans votre CRM Loro.
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
        <h3 className="text-lg font-medium mb-2">Paramètres optionnels</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4 text-left">Champ</th>
              <th className="py-2 px-4 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 px-4"><code>phone</code></td>
              <td className="py-2 px-4">Numéro de téléphone</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-4"><code>source</code></td>
              <td className="py-2 px-4">Source du lead (ex: Site web, Idealista, etc.)</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-4"><code>property_reference</code></td>
              <td className="py-2 px-4">Référence du bien immobilier</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-4"><code>external_id</code></td>
              <td className="py-2 px-4">ID externe pour éviter les doublons</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-4"><code>message</code></td>
              <td className="py-2 px-4">Message ou note du lead</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-4"><code>location</code></td>
              <td className="py-2 px-4">Localisation du lead</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-4"><code>integration_source</code></td>
              <td className="py-2 px-4">Source de l'intégration (ex: wordpress, wix, etc.)</td>
            </tr>
            <tr>
              <td className="py-2 px-4">Autres champs...</td>
              <td className="py-2 px-4">Tous les autres champs du modèle Lead sont également supportés</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Exemples d'intégration</h3>
        <Tabs defaultValue="curl">
          <TabsList className="mb-4">
            <TabsTrigger value="curl">cURL</TabsTrigger>
            <TabsTrigger value="fetch">JavaScript Fetch</TabsTrigger>
            <TabsTrigger value="php">PHP</TabsTrigger>
            <TabsTrigger value="wordpress">WordPress</TabsTrigger>
          </TabsList>
          
          <TabsContent value="curl" className="relative">
            <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">{curlExample}</pre>
            <button 
              className="absolute top-2 right-2 p-2 rounded-md hover:bg-background transition-colors"
              onClick={() => copyToClipboard(curlExample, 'curl')}
            >
              {copied === 'curl' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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
          
          <TabsContent value="php" className="relative">
            <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">{phpExample}</pre>
            <button 
              className="absolute top-2 right-2 p-2 rounded-md hover:bg-background transition-colors"
              onClick={() => copyToClipboard(phpExample, 'php')}
            >
              {copied === 'php' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </TabsContent>
          
          <TabsContent value="wordpress" className="relative">
            <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">{wordpressExample}</pre>
            <button 
              className="absolute top-2 right-2 p-2 rounded-md hover:bg-background transition-colors"
              onClick={() => copyToClipboard(wordpressExample, 'wordpress')}
            >
              {copied === 'wordpress' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Pour toute question sur l'intégration, veuillez contacter notre équipe technique.
        </p>
      </div>
    </div>
  );
};

export default LeadApiGuide;
