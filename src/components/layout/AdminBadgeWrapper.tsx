
import React, { memo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AdminBadge } from '@/components/ui/admin-badge';

// Use memo to prevent unnecessary re-renders
const AdminBadgeWrapper: React.FC = memo(() => {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminBadge /> : null;
});

AdminBadgeWrapper.displayName = 'AdminBadgeWrapper';

export default AdminBadgeWrapper;
