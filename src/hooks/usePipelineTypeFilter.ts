
import { useState, useEffect } from 'react';
import { PipelineType } from '@/types/lead';

/**
 * Custom hook to manage pipeline type filtering and transitions
 */
export const usePipelineTypeFilter = (initialType: PipelineType = 'purchase') => {
  const [pipelineType, setPipelineType] = useState<PipelineType>(initialType);
  const [isChangingType, setIsChangingType] = useState(false);

  // Save pipeline type preference to local storage
  useEffect(() => {
    localStorage.setItem('preferredPipelineType', pipelineType);
  }, [pipelineType]);

  // Load preferred pipeline type from local storage on mount
  useEffect(() => {
    const savedType = localStorage.getItem('preferredPipelineType') as PipelineType | null;
    if (savedType && (savedType === 'purchase' || savedType === 'rental')) {
      setPipelineType(savedType);
    }
  }, []);

  const togglePipelineType = () => {
    setIsChangingType(true);
    setPipelineType(prev => prev === 'purchase' ? 'rental' : 'purchase');
    
    // Add a small delay to allow UI transitions
    setTimeout(() => {
      setIsChangingType(false);
    }, 500);
  };

  return {
    pipelineType,
    setPipelineType,
    isChangingType,
    togglePipelineType
  };
};

export default usePipelineTypeFilter;
