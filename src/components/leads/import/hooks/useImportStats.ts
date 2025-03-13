
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ImportStat, processSourceStats, SourceStats } from '../utils/statsUtils';

export const useImportStats = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ImportStat[]>([]);
  const [sourceStats, setSourceStats] = useState<SourceStats[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchImportStats();
  }, []);

  const fetchImportStats = async () => {
    try {
      setLoading(true);
      // Using a raw query to work around type issues
      const { data, error: queryError } = await supabase
        .from('import_statistics')
        .select('*')
        .order('import_date', { ascending: false })
        .limit(100);

      if (queryError) throw queryError;
      
      setStats(data as ImportStat[]);
      const processedSourceStats = processSourceStats(data as ImportStat[]);
      setSourceStats(processedSourceStats);
    } catch (err) {
      console.error('Error fetching import statistics:', err);
      setError('Impossible de charger les statistiques d\'importation');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    stats,
    sourceStats,
    activeTab,
    setActiveTab
  };
};
