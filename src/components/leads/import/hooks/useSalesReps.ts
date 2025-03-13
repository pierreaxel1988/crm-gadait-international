
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useSalesReps = () => {
  const [salesReps, setSalesReps] = useState<{id: string, name: string}[]>([]);
  const [loadingReps, setLoadingReps] = useState(false);

  useEffect(() => {
    const fetchSalesReps = async () => {
      setLoadingReps(true);
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('id, name')
          .order('name');
        
        if (error) throw error;
        setSalesReps(data || []);
      } catch (err) {
        console.error("Erreur lors du chargement des commerciaux:", err);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger la liste des commerciaux."
        });
      } finally {
        setLoadingReps(false);
      }
    };

    fetchSalesReps();
  }, []);

  return { salesReps, loadingReps };
};
