import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import HotPipelineMonitor from '@/components/admin/HotPipelineMonitor';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame } from 'lucide-react';

const AgentHotPipeline: React.FC = () => {
  const { user } = useAuth();

  const { data: teamMemberId, isLoading } = useQuery({
    queryKey: ['my-team-member-id', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const { data } = await supabase
        .from('team_members')
        .select('id')
        .eq('email', user.email)
        .single();
      return data?.id || null;
    },
    enabled: !!user?.email,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SubNavigation />
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Flame className="h-5 w-5 text-orange-500" />
          <h1 className="text-2xl font-normal text-foreground">Pipeline Chaud</h1>
        </div>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : teamMemberId ? (
          <HotPipelineMonitor agentId={teamMemberId} />
        ) : (
          <p className="text-muted-foreground">Aucun profil agent trouvé pour votre compte.</p>
        )}
      </div>
    </div>
  );
};

export default AgentHotPipeline;
