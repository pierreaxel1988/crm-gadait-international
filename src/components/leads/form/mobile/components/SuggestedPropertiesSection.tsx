import React from 'react';
import { LeadDetailed } from '@/types/lead';
import SuggestedPropertiesFullView from './SuggestedPropertiesFullView';

interface SuggestedPropertiesSectionProps {
  lead: LeadDetailed;
}

const SuggestedPropertiesSection: React.FC<SuggestedPropertiesSectionProps> = ({ lead }) => {
  return <SuggestedPropertiesFullView lead={lead} />;
};

export default SuggestedPropertiesSection;