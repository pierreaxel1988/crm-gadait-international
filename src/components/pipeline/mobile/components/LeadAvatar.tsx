
import React from 'react';
import { Avatar } from "@/components/ui/avatar";

interface LeadAvatarProps {
  name: string;
}

const LeadAvatar: React.FC<LeadAvatarProps> = ({ name }) => {
  return (
    <div className="mr-3">
      <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
        <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium">
          {name ? name.charAt(0).toUpperCase() : ''}
        </div>
      </Avatar>
    </div>
  );
};

export default LeadAvatar;
