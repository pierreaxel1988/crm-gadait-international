
import React from 'react';
import LoadingScreen from '../layout/LoadingScreen';

interface ComponentLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  height?: string | number;
}

const ComponentLoader: React.FC<ComponentLoaderProps> = ({ 
  isLoading, 
  children, 
  className,
  height = "100%" 
}) => {
  if (isLoading) {
    return <LoadingScreen fullscreen={false} className={className || `min-h-[${typeof height === 'number' ? `${height}px` : height}]`} />;
  }
  
  return <>{children}</>;
};

export default ComponentLoader;
