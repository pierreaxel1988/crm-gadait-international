
import React from 'react';
import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const LoadingScreen = ({ className }: { className?: string }) => {
  return (
    <div className={cn(
      "fixed inset-0 flex flex-col items-center justify-center bg-white z-50",
      className
    )}>
      <div className="flex items-center gap-3 animate-pulse">
        <Shield className="h-6 w-6 text-zinc-900" />
        <span className="font-futura tracking-tight text-zinc-900 text-xl uppercase">
          GADAIT.
        </span>
      </div>
      <div className="mt-6 w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-zinc-900 animate-[loading_1s_ease-in-out_infinite]" />
      </div>
    </div>
  );
};

export default LoadingScreen;
