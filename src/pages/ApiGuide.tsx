
import React from 'react';
import LeadApiGuide from '@/components/leads/LeadApiGuide';

const ApiGuide = () => {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-loro-navy">Guide d'intégration API</h1>
        <p className="text-loro-hazel">Documentation et exemples pour l'intégration de l'API Loro</p>
      </div>
      <LeadApiGuide />
    </div>
  );
};

export default ApiGuide;
