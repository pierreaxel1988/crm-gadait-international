import React from 'react';
import { ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useActionsBadgeCount } from '@/hooks/useActionsBadgeCount';
import { cn } from '@/lib/utils';

const ActionsBadge = () => {
  const navigate = useNavigate();
  const { overdueCount, todayCount, totalCount } = useActionsBadgeCount();

  const handleClick = () => {
    navigate('/actions');
  };

  const displayCount = totalCount > 99 ? '99+' : totalCount.toString();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            className="rounded-md p-1.5 transition-transform duration-200 hover:scale-110 relative touch-none" 
            onClick={handleClick}
          >
            <ClipboardList className="h-5 w-5 text-white" />
            {totalCount > 0 && (
              <span className={cn(
                "absolute -top-1 -right-1 rounded-full text-xs px-1 min-w-5 h-5 flex items-center justify-center font-medium text-white",
                overdueCount > 0 ? "bg-destructive" : "bg-loro-terracotta"
              )}>
                {displayCount}
              </span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <span>
            {overdueCount > 0 && `${overdueCount} en retard · `}
            {todayCount > 0 && `${todayCount} aujourd'hui`}
            {totalCount === 0 && 'Aucune action'}
          </span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ActionsBadge;
