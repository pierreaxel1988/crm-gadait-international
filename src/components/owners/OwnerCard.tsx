
import React from "react";
import { Users } from "lucide-react";

interface OwnerCardProps {
  owner: any;
}

const OwnerCard: React.FC<OwnerCardProps> = ({ owner }) => (
  <div className="border rounded-xl p-4 flex justify-between items-start bg-white hover:shadow transition-all cursor-pointer">
    <div>
      <div className="font-semibold text-sm mb-1 flex items-center gap-2">
        <Users className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs">{owner.full_name}</span>
      </div>
      <div className="text-xs text-muted-foreground">{owner.email}</div>
      <div className="text-2xs text-muted-foreground mt-1">{owner.relationship_status}</div>
    </div>
    {/* extension point for details/actions */}
  </div>
);

export default OwnerCard;
