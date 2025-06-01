
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const CriteriaConfirmation = () => {
  const { leadId } = useParams<{ leadId: string }>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-loro-pearl to-white flex items-center justify-center py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="shadow-xl text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-futura text-loro-terracotta">
              Critères enregistrés avec succès !
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <p className="text-gray-600 text-lg">
              Merci d'avoir rempli vos critères de recherche. Notre équipe va maintenant analyser vos besoins et vous proposer une sélection de propriétés qui correspondent parfaitement à vos attentes.
            </p>
            
            <div className="bg-loro-pearl/30 p-6 rounded-lg">
              <h3 className="font-medium text-loro-terracotta mb-2">Prochaines étapes :</h3>
              <ul className="text-left space-y-2 text-gray-700">
                <li>• Analyse de vos critères par notre équipe d'experts</li>
                <li>• Sélection personnalisée de propriétés</li>
                <li>• Contact sous 24h pour organiser les visites</li>
                <li>• Accompagnement personnalisé tout au long du processus</li>
              </ul>
            </div>
            
            <p className="text-sm text-gray-500">
              Vous recevrez bientôt un email de confirmation avec le récapitulatif de vos critères.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CriteriaConfirmation;
