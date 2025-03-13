
import React from 'react';
import LeadApiGuide from '@/components/leads/LeadApiGuide';

const ApiGuide = () => {
  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-6 space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-semibold text-loro-navy">Guide d'intégration API</h1>
        <p className="text-loro-hazel mt-2">Documentation détaillée et exemples pour l'intégration de l'API Loro</p>
      </div>
      <LeadApiGuide />
    </div>
  );
};

export default ApiGuide;
