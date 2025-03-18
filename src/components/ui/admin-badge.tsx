
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

export const AdminBadge = () => {
  return (
    <Badge className="bg-[#8B5CF6] hover:bg-[#7E69AB] text-white border-0 flex items-center gap-1.5 px-2 py-1">
      <Shield className="h-3.5 w-3.5" />
      Admin
    </Badge>
  );
};
