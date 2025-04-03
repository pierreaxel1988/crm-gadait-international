
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CommercialBadge } from '@/components/ui/commercial-badge';

const CommercialBadgeWrapper: React.FC = () => {
  const { isCommercial } = useAuth();

  if (!isCommercial) return null;
  
  return <CommercialBadge />;
};

export default CommercialBadgeWrapper;
