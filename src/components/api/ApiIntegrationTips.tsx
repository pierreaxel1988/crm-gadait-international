
import React from 'react';

const ApiIntegrationTips = () => {
  return (
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
  );
};

export default ApiIntegrationTips;
