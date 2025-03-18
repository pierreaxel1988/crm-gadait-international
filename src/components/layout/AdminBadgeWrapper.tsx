
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AdminBadge } from '@/components/ui/admin-badge';

const AdminBadgeWrapper: React.FC = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) return null;
  
  return (
    <div className="ml-2">
      <AdminBadge />
    </div>
  );
};

export default AdminBadgeWrapper;
