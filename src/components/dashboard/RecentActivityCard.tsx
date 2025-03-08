
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
    <div className={cn('luxury-card p-6 scale-in', className)}>
      <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 slide-in">
            <div className="relative mt-1">
              {activity.user.avatar ? (
                <img
                  src={activity.user.avatar}
                  alt={activity.user.name}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                  {activity.user.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-medium">{activity.user.name}</span>{' '}
                <span className="text-muted-foreground">{activity.action}</span>{' '}
                <span className="font-medium">{activity.target}</span>
              </p>
              <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
      {activities.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">No recent activities</p>
      )}
      {activities.length > 0 && (
        <div className="mt-4">
          <button className="text-sm text-primary hover:text-primary/90 transition-colors">
            View all activity
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivityCard;
