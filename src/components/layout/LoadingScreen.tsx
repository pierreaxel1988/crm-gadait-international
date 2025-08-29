
import React from 'react';
import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  className?: string;
  fullscreen?: boolean;
}

const LoadingScreen = ({ className, fullscreen = true }: LoadingScreenProps) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center bg-white z-50",
      fullscreen && "fixed inset-0",
      !fullscreen && "h-full w-full min-h-[200px] py-8",
      className
    )}>
      <div className="animate-[scale-in_0.8s_ease-in-out_infinite_alternate]">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-zinc-900" />
          <span className="font-futura tracking-tight text-zinc-900 text-xl uppercase">
            GADAIT.
          </span>
        </div>
      </div>
      <div className="mt-4 w-16 h-0.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-zinc-900 animate-[loading_0.8s_ease-in-out_infinite]" />
      </div>
    </div>
  );
};

export default LoadingScreen;
