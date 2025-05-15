
import React from 'react';
import { cn } from '@/lib/utils';

interface ImmersiveHeaderOverlayProps {
  className?: string;
}

const ImmersiveHeaderOverlay: React.FC<ImmersiveHeaderOverlayProps> = ({ className }) => {
  return (
    <div className={cn(
      "absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-30",
      className
    )}></div>
  );
};

export default ImmersiveHeaderOverlay;
