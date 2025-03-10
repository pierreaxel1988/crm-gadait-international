
import { toast } from "@/hooks/use-toast";

// Synchroniser les propriétés
export const syncProperties = async (): Promise<number> => {
  try {
    const response = await fetch('/api/sync-properties');
    const data = await response.json();
    
    if (data.error) {
      toast({
        variant: "destructive",
        title: "Erreur de synchronisation",
        description: data.error
      });
      return 0;
    }
    
    toast({
      title: "Synchronisation réussie",
      description: `${data.count} propriétés synchronisées`
    });
    
    return data.count;
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Erreur de synchronisation",
      description: "Impossible de synchroniser les propriétés"
    });
    return 0;
  }
};
