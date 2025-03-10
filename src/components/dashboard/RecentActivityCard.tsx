
import React from 'react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target: string;
  timestamp: string;
}

interface RecentActivityCardProps {
  activities: Activity[];
  className?: string;
}

const RecentActivityCard = ({ activities, className }: RecentActivityCardProps) => {
  return (
    <div className={cn('luxury-card p-5 lg:p-7 scale-in', className)}>
      <h3 className="text-lg font-medium mb-5">Recent Activity</h3>
      <div className="space-y-6 mt-4 overflow-y-auto max-h-[calc(100%-5rem)]">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4 slide-in p-2 hover:bg-muted/30 rounded-lg transition-colors">
            <div className="relative mt-0.5">
              {activity.user.avatar ? (
                <img
                  src={activity.user.avatar}
                  alt={activity.user.name}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                  {activity.user.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm lg:text-base">
                <span className="font-medium">{activity.user.name}</span>{' '}
                <span className="text-muted-foreground">{activity.action}</span>{' '}
                <span className="font-medium">{activity.target}</span>
              </p>
              <p className="text-xs lg:text-sm text-muted-foreground mt-1">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
      {activities.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">No recent activities</p>
      )}
      {activities.length > 0 && (
        <div className="mt-6">
          <button className="text-sm text-primary hover:text-primary/90 transition-colors">
            View all activity
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivityCard;
